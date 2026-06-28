import scala.sys.process._
import java.nio.file.{Files, Paths}

val skeletonRoot = "{{skeleton_root}}"
val entryPath = "{{entry_file}}"

sys.props ++= Map(
  "RUNSPACE_FRAMEWORK_ROOT" -> skeletonRoot,
  "RUNSPACE_ENTRY_PATH" -> entryPath
)

val cp = Files.readString(Paths.get(skeletonRoot, "target", "runspace-classpath"))
val scalaBin = "{{scala_path}}"
val exitCode = Process(Seq(scalaBin, "-cp", cp, entryPath)).!

sys.exit(exitCode)
