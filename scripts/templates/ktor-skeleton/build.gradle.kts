import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    kotlin("jvm") version "2.1.10"
}

group = "runspace"
version = "1.0.0"

repositories {
    mavenCentral()
}

val ktorVersion: String = findProperty("ktorVersion") as String? ?: "3.1.1"

dependencies {
    implementation("io.ktor:ktor-server-core:$ktorVersion")
    implementation("io.ktor:ktor-server-netty:$ktorVersion")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("ch.qos.logback:logback-classic:1.5.16")
}

kotlin {
    jvmToolchain(21)
}

tasks.register("runspaceResolveDeps") {
    group = "runspace"
    dependsOn("compileKotlin")
    doLast {
        layout.buildDirectory.file("runspace-deps.ready").get().asFile.writeText("ok\n")
    }
}

fun compileRunspaceEntry(entryPath: String): TaskProvider<KotlinCompile> {
    val entryFile = file(entryPath)
    return tasks.register<KotlinCompile>("compileRunspaceEntry") {
        source(entryFile)
        destinationDirectory.set(layout.buildDirectory.dir("runspace-entry/classes"))
        libraries.from(sourceSets.named("main").get().compileClasspath)
        compilerOptions {
            jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_21)
        }
    }
}

tasks.register<JavaExec>("runspaceRun") {
    group = "runspace"
    val entryPath = providers.gradleProperty("runspace.entry").orNull
        ?: error("Gradle property runspace.entry is required")
    val entryCompile = compileRunspaceEntry(entryPath)
    dependsOn("compileKotlin", entryCompile)
    classpath = sourceSets["main"].runtimeClasspath + files(
        layout.buildDirectory.dir("runspace-entry/classes")
    )
    val entryBaseName = file(entryPath).nameWithoutExtension
    mainClass.set("${entryBaseName}Kt")
}
