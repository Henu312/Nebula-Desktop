use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct NebulaError {
    pub code: String,
    pub message: String,
    pub detail: Option<String>,
}

impl NebulaError {
    pub fn with_detail(
        code: impl Into<String>,
        message: impl Into<String>,
        detail: impl Into<String>,
    ) -> Self {
        Self {
            code: code.into(),
            message: message.into(),
            detail: Some(detail.into()),
        }
    }
}
