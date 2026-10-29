//! 文本解码和 CSV 解析。中文 CSV 常是 GBK 或带 BOM 的 UTF-16（Excel 导出）。

use encoding_rs::Encoding;
use serde::Serialize;
use sha2::{Digest, Sha256};

use crate::error::{Error, Result};

pub fn hash(bytes: &[u8]) -> String {
    format!("{:x}", Sha256::digest(bytes))
}

/// 按 BOM → UTF-8 → 自动探测的顺序解码，返回文本和编码名。
pub fn decode(bytes: &[u8]) -> (String, &'static str) {
    if let Some((enc, bom_len)) = Encoding::for_bom(bytes) {
        let (s, _) = enc.decode_without_bom_handling(&bytes[bom_len..]);
        return (s.into_owned(), enc.name());
    }
    if let Ok(s) = std::str::from_utf8(bytes) {
        return (s.to_owned(), "UTF-8");
    }
    let mut det = chardetng::EncodingDetector::new(chardetng::Iso2022JpDetection::Deny);
    det.feed(bytes, true);
    let enc = det.guess(None, chardetng::Utf8Detection::Deny);
    let (s, _, _) = enc.decode(bytes);
    (s.into_owned(), enc.name())
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CsvData {
    pub rows: Vec<Vec<String>>,
    pub encoding: String,
    pub delimiter: String,
}

pub fn parse_csv(bytes: &[u8]) -> Result<CsvData> {
    let (text, encoding) = decode(bytes);
    let delimiter = sniff_delimiter(&text);
    let mut rdr = csv::ReaderBuilder::new()
        .has_headers(false)
        .flexible(true)
        .delimiter(delimiter)
        .from_reader(text.as_bytes());
    let mut rows = Vec::new();
    for rec in rdr.records() {
        let rec = rec.map_err(|e| Error::Other(e.to_string()))?;
        rows.push(rec.iter().map(str::to_owned).collect());
    }
    Ok(CsvData {
        rows,
        encoding: encoding.into(),
        delimiter: (delimiter as char).to_string(),
    })
}

/// 看首行里哪个分隔符最多；都没有或打平时用逗号。
fn sniff_delimiter(text: &str) -> u8 {
    let first = text.lines().next().unwrap_or("");
    let (d, n) = [b';', b'\t', b',']
        .into_iter()
        .map(|d| (d, first.matches(d as char).count()))
        .max_by_key(|&(_, n)| n)
        .unwrap();
    if n == 0 {
        b','
    } else {
        d
    }
}
