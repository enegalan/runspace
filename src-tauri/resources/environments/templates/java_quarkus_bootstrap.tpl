import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class runspace_bootstrap {
    public static void main(String[] args) throws Exception {
        String skeletonRoot = '{{skeleton_root}}';
        String entryPath = '{{entry_file}}';
        String workspacePath = '{{workspace_path}}';
        String javaBin = '{{java_path}}';

        Path javacBin = Paths.get(javaBin).getParent().resolve("javac");
        if (!Files.isExecutable(javacBin)) {
            System.err.println("javac not found beside Java binary: " + javacBin);
            System.exit(1);
        }

        String classpath = Files.readString(
            Paths.get(skeletonRoot, "target", "runspace-classpath.txt")
        ).trim();
        Path outDir = Paths.get(workspacePath, ".runspace-java-out");
        Files.createDirectories(outDir);

        String source = Files.readString(Paths.get(entryPath));
        Matcher matcher = Pattern.compile("public\\s+class\\s+(\\w+)").matcher(source);
        if (!matcher.find()) {
            System.err.println("Entry file must declare a public class.");
            System.exit(1);
        }
        String className = matcher.group(1);

        List<String> compileCmd = new ArrayList<>();
        compileCmd.add(javacBin.toString());
        compileCmd.add("-classpath");
        compileCmd.add(classpath);
        compileCmd.add("-d");
        compileCmd.add(outDir.toString());
        compileCmd.add(entryPath);

        Process compile = new ProcessBuilder(compileCmd).inheritIO().start();
        if (compile.waitFor() != 0) {
            System.exit(compile.exitValue());
        }

        List<String> runCmd = new ArrayList<>();
        runCmd.add(javaBin);
        runCmd.add("-classpath");
        runCmd.add(classpath + File.pathSeparator + outDir.toString());
        runCmd.add(className);

        ProcessBuilder run = new ProcessBuilder(runCmd);
        Map<String, String> env = run.environment();
        env.put("RUNSPACE_FRAMEWORK_ROOT", skeletonRoot);
        env.put("RUNSPACE_ENTRY_PATH", entryPath);
        run.inheritIO();
        Process runProcess = run.start();
        System.exit(runProcess.waitFor());
    }
}
