!include nsDialogs.nsh

!ifdef BUILD_UNINSTALLER
  Var DeleteChatHubUserData
  Var UninstallDataCheckbox
!endif

!macro customHeader
!macroend

!macro customCheckAppRunning
  IfFileExists "$INSTDIR\${APP_EXECUTABLE_FILENAME}" 0 skipGracefulQuit
    DetailPrint "Requesting ChatHub to quit for uninstall..."
    nsExec::ExecToLog `"$INSTDIR\${APP_EXECUTABLE_FILENAME}" --quit-for-uninstall`
    Sleep 2000

  skipGracefulQuit:

  ClearErrors
  nsExec::ExecToStack `%SYSTEMROOT%\System32\cmd.exe /c tasklist /FI "IMAGENAME eq ${APP_EXECUTABLE_FILENAME}" /FO csv | %SYSTEMROOT%\System32\find.exe "${APP_EXECUTABLE_FILENAME}"`
  Pop $R0
  Pop $R1

  ${if} $R0 == 0
    ${ifNot} ${Silent}
      MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION "ChatHub is still running. The uninstaller must close all ChatHub and Electron child processes before removing program files." /SD IDOK IDOK closeChatHubProcesses
      Quit
    ${endif}

    closeChatHubProcesses:
      DetailPrint "Closing ChatHub process tree..."
      nsExec::ExecToLog `%SYSTEMROOT%\System32\cmd.exe /c taskkill /T /F /IM "${APP_EXECUTABLE_FILENAME}"`
      IfFileExists "$INSTDIR\electron.exe" 0 skipElectronExeKill
        nsExec::ExecToLog `%SYSTEMROOT%\System32\cmd.exe /c taskkill /T /F /IM "electron.exe"`
      skipElectronExeKill:
      Sleep 1200

      ClearErrors
      nsExec::ExecToStack `%SYSTEMROOT%\System32\cmd.exe /c tasklist /FI "IMAGENAME eq ${APP_EXECUTABLE_FILENAME}" /FO csv | %SYSTEMROOT%\System32\find.exe "${APP_EXECUTABLE_FILENAME}"`
      Pop $R0
      Pop $R1

      ${if} $R0 == 0
        MessageBox MB_RETRYCANCEL|MB_ICONEXCLAMATION "ChatHub is still running. Close it and retry uninstall." /SD IDCANCEL IDRETRY closeChatHubProcesses
        Quit
      ${endif}
  ${endif}
!macroend

!macro customUnInit
  StrCpy $DeleteChatHubUserData "0"
!macroend

!macro customUnWelcomePage
  !ifdef BUILD_UNINSTALLER
    UninstPage custom un.ChatHubUninstallPageCreate un.ChatHubUninstallPageLeave
  !endif
!macroend

!ifdef BUILD_UNINSTALLER
Function un.ChatHubUninstallPageCreate
  nsDialogs::Create 1018
  Pop $R0
  ${if} $R0 == error
    Abort
  ${endif}

  GetDlgItem $R1 $HWNDPARENT 1
  SendMessage $R1 0x000C 0 "STR:卸载"

  ${NSD_CreateLabel} 0u 0u 100% 12u "卸载 ChatHub"
  Pop $R1

  ${NSD_CreateLabel} 0u 16u 100% 10u "将从本机移除 ChatHub 程序"
  Pop $R1

  ${NSD_CreateLabel} 0u 42u 100% 16u "此向导将从本机移除 ChatHub。点击“卸载”开始卸载。"
  Pop $R1

  ${NSD_CreateLabel} 0u 78u 55u 12u "安装目录："
  Pop $R1

  ${NSD_CreateText} 62u 74u 235u 14u "$INSTDIR"
  Pop $R1
  SendMessage $R1 0x00CF 1 0

  ${NSD_CreateCheckbox} 0u 112u 100% 16u "删除用户数据（登录状态 / 缓存 / 日志 / 设置 / 任务）"
  Pop $UninstallDataCheckbox
  ${NSD_Uncheck} $UninstallDataCheckbox

  nsDialogs::Show
FunctionEnd

Function un.ChatHubUninstallPageLeave
  ${NSD_GetState} $UninstallDataCheckbox $R0
  ${if} $R0 == ${BST_CHECKED}
    StrCpy $DeleteChatHubUserData "1"
  ${else}
    StrCpy $DeleteChatHubUserData "0"
  ${endif}
FunctionEnd
!endif

!macro customUnInstall
  DetailPrint "Cleaning remaining ChatHub program files..."
  RMDir /r "$INSTDIR"

  DetailPrint "Scheduling delayed install directory cleanup..."
  FileOpen $R8 "$TEMP\chathub-cleanup.vbs" w
  FileWrite $R8 "On Error Resume Next$\r$\n"
  FileWrite $R8 "Set shell = CreateObject($\"WScript.Shell$\")$\r$\n"
  FileWrite $R8 "Set fso = CreateObject($\"Scripting.FileSystemObject$\")$\r$\n"
  FileWrite $R8 "shell.CurrentDirectory = shell.ExpandEnvironmentStrings($\"%TEMP%$\")$\r$\n"
  FileWrite $R8 "WScript.Sleep 3000$\r$\n"
  FileWrite $R8 "fso.DeleteFolder $\"$INSTDIR$\", True$\r$\n"
  FileWrite $R8 "fso.DeleteFile WScript.ScriptFullName, True$\r$\n"
  FileClose $R8
  Exec `"$SYSDIR\wscript.exe" "$TEMP\chathub-cleanup.vbs"`

  ${if} $DeleteChatHubUserData == "1"
    DetailPrint "Deleting ChatHub user data by user request..."
    SetShellVarContext current
    RMDir /r "$APPDATA\AI Chat Hub"
    RMDir /r "$LOCALAPPDATA\AI Chat Hub"
    RMDir /r "$APPDATA\ChatHub"
    RMDir /r "$LOCALAPPDATA\ChatHub"
    RMDir /r "$APPDATA\chathub"
    RMDir /r "$LOCALAPPDATA\chathub"
  ${else}
    DetailPrint "Keeping ChatHub user data."
  ${endif}
!macroend
