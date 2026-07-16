; Build on Windows with Inno Setup 6+ after running desktop.package.windows.
; Open this file in Inno Setup Compiler, or:
;   iscc scripts\grims-desktop.iss
;
; Branding is generated from:
;   frontend/src/assets/GRIMS_logo.png  -> installer wizard images
;   frontend/public/grim16.png          -> app/setup icon
;
; Regenerate assets with:
;   python3 scripts/generate-installer-assets.py
;
; If the repo lives on WSL (\\wsl.localhost\...), do NOT set OutputDir under dist\.
; Inno Setup often fails with Error 32 when writing setup.exe across WSL mounts.
; This script writes the installer to Documents\GRIMS on Windows instead.

#define AppVersion "0.4.0"
#define DistDir "..\dist\grims-desktop-windows-x86_64"
#define InstallerAssetsDir "installer"

[Setup]
AppId={{A4E8F2B1-9C3D-4E5F-8A1B-2D3C4E5F6A7B}
AppName=GRIMS
AppVersion={#AppVersion}
AppPublisher=GRIMS
DefaultDirName={autopf}\GRIMS
DefaultGroupName=GRIMS
DisableProgramGroupPage=yes
OutputDir={userdocs}\GRIMS
OutputBaseFilename=grims-desktop-windows-x86_64-setup
SetupIconFile={#InstallerAssetsDir}\grims.ico
WizardImageFile={#InstallerAssetsDir}\wizard-large.bmp
WizardSmallImageFile={#InstallerAssetsDir}\wizard-small.bmp
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
PrivilegesRequired=admin
MinVersion=10.0

[Files]
Source: "{#DistDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\GRIMS"; Filename: "{app}\run-grims.vbs"; IconFilename: "{app}\grims.ico"; WorkingDir: "{app}"
Name: "{autodesktop}\GRIMS"; Filename: "{app}\run-grims.vbs"; IconFilename: "{app}\grims.ico"; WorkingDir: "{app}"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut"; GroupDescription: "Additional icons:"

[Run]
Filename: "{app}\redist\vc_redist.x64.exe"; \
  Parameters: "/install /quiet /norestart"; \
  StatusMsg: "Installing Microsoft Visual C++ runtime..."; \
  Check: VCRedistNeedsInstall; \
  Flags: waituntilterminated
Filename: "{app}\run-grims.vbs"; Description: "Launch GRIMS"; Flags: nowait postinstall skipifsilent shellexec

[Code]
function VCRedistInstalled(const Key: string): Boolean;
var
  Installed: Cardinal;
begin
  Result := False;
  if RegQueryDWordValue(HKLM, Key, 'Installed', Installed) then
    Result := Installed = 1;
end;

function VCRedistNeedsInstall: Boolean;
begin
  Result := not VCRedistInstalled('SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64');
  if Result then
    Result := not VCRedistInstalled('SOFTWARE\WOW6432Node\Microsoft\VisualStudio\14.0\VC\Runtimes\x64');
end;
