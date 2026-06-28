import kotlin.system.exitProcess

val skeletonRoot = "{{skeleton_root}}"
val entryPath = "{{entry_file}}"
val gradlePath = "{{gradle_path}}"

val process = ProcessBuilder(
    listOf(
        gradlePath,
        "-p",
        skeletonRoot,
        "runspaceRun",
        "-Prunspace.entry=$entryPath",
        "--quiet",
        "--console=plain"
    )
)
    .inheritIO()
    .start()

exitProcess(process.waitFor())
