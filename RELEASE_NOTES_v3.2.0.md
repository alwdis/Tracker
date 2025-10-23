# Release Notes v3.2.0

## 🎉 Cloud Synchronization Support

This major release adds comprehensive cloud synchronization capabilities to Tracker, allowing users to backup and restore their media collections across multiple cloud providers.

## ✨ New Features

### 🌐 Cloud Synchronization
- **Google Drive Integration**: Full OAuth 2.0 authentication with secure token storage
- **Yandex.Disk Integration**: WebDAV-based synchronization for Russian users
- **Unified Cloud Sync Dialog**: Easy provider selection and management
- **Automatic Backup Creation**: Seamless backup generation with timestamps
- **Secure Data Handling**: Encrypted data transmission and storage

### 🔧 Technical Improvements
- **Fixed Dev Mode Issues**: Resolved black screen problems in development builds
- **Enhanced Webpack Configuration**: Better Electron compatibility and HMR support
- **Improved Error Handling**: Comprehensive error messages and user feedback
- **Debug Logging**: Extensive logging for troubleshooting cloud sync issues
- **Better File Path Handling**: Robust backup file management

## 🐛 Bug Fixes
- Fixed missing `usePWA` import causing React compilation errors
- Resolved webpack target conflicts between dev and production builds
- Fixed backup file path issues in different environments
- Corrected Google Drive `appDataFolder` handling for proper file storage
- Fixed Yandex.Disk folder creation conflicts (409 errors)

## 📚 Documentation
- Added comprehensive Google Drive API setup guide
- Updated README with cloud synchronization instructions
- Added security considerations for API key management
- Included troubleshooting guides for common issues

## 🔒 Security
- Secure OAuth 2.0 token storage
- API keys excluded from version control
- Encrypted data transmission
- User data privacy protection

## 🚀 Getting Started with Cloud Sync

### Google Drive Setup
1. Follow the detailed guide in `GOOGLE_DRIVE_SETUP.md`
2. Create a Google Cloud Console project
3. Enable Google Drive API
4. Configure OAuth 2.0 credentials
5. Add redirect URI: `http://localhost:8888/oauth2callback`

### Yandex.Disk Setup
1. Enable WebDAV access in your Yandex.Disk settings
2. Use your Yandex account credentials
3. Files will be stored in `/Tracker/` folder

## 📋 System Requirements
- Windows 10/11
- Internet connection for cloud synchronization
- Google account (for Google Drive) or Yandex account (for Yandex.Disk)

## 🔄 Migration from Previous Versions
This release is fully backward compatible. Existing data will be preserved and can be synchronized to the cloud using the new features.

---

**Download**: [Latest Release](https://github.com/alwdis/Tracker/releases/latest)
**Issues**: [Report Bugs](https://github.com/alwdis/Tracker/issues)
**Documentation**: [Setup Guide](GOOGLE_DRIVE_SETUP.md)
