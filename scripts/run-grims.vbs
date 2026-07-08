Set fso = CreateObject("Scripting.FileSystemObject")
installDir = fso.GetParentFolderName(WScript.ScriptFullName)

Set shell = CreateObject("WScript.Shell")
shell.CurrentDirectory = installDir
shell.Run "cmd /c """ & installDir & "\run-grims.bat""", 0, False
