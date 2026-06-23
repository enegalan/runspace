fn main() {
    println!("cargo:rerun-if-changed=icons/icon.png");
    println!("cargo:rerun-if-changed=icons/icon.icns");
    println!("cargo:rerun-if-changed=resources/environments");
    println!("cargo:rerun-if-changed=resources/environments/templates");
    tauri_build::build()
}
