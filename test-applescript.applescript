on run
    set appBundlePath to POSIX path of (path to me as string)
    set launcherPath to appBundlePath & "Contents/Resources/launcher.sh"
    tell application "Terminal"
        activate
        do script "bash '" & launcherPath & "'"
    end tell
end run
