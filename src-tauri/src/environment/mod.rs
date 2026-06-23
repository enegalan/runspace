pub mod detect;
pub mod manager;
pub mod manifest;
pub mod registry;
pub mod types;

pub use manager::EnvironmentManager;
pub use types::{Environment, EnvironmentDefinition, ResolvedEnvironment, ValidationResult};
