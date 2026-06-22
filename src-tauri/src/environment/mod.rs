pub mod catalog;
pub mod detect;
pub mod manager;
pub mod types;

pub use manager::EnvironmentManager;
pub use types::{Environment, EnvironmentDefinition, ResolvedEnvironment, ValidationResult};
