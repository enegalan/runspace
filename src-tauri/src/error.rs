pub fn map_err<T, E: ToString>(result: Result<T, E>) -> Result<T, String> {
    result.map_err(|e| e.to_string())
}

pub fn lock_err<T>(result: Result<T, std::sync::PoisonError<T>>, name: &str) -> Result<T, String> {
    result.map_err(|_| format!("{name} lock poisoned"))
}
