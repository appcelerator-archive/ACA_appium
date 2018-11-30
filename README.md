# ACA Appium

## Setup on MacOS

### Install HomeBrew
`/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`

### Install Java
The installer can be downloaded from [here](https://www.oracle.com/technetwork/java/javase/downloads/index.html).

### Install Android Studio
The installer can be downloaded from [here](https://developer.android.com/studio/).

Alternatively you can also use `brew cask install android-studio` if you have HomeBrew installed.

### Download the Necessary Android SDKs Within Android Studio
From the studio download manager, download the latest SDKs. The SDKs are required for application builds.

### Configure an Android Emulator Within Android Studio
The device name that Appium will use can be found in `Config/Test_Config.js`. A matching device needs to be created on the local machine. This is usually done within Android Studio for ease of use.

### Install the Appcelerator CLI
Run `npm i appcelerator -g`

### Install iOS Device Dependencies
* Install ios-deploy `npm i -g ios-deploy`.

* Install carthage `brew install carthage`.

* Install libimobiledevice `brew install libimobiledevice`.

### Install npm Packages
From the project root, run `npm i`.

## Required Environment Variables
These are values that the suite needs in order to use all of its functionality. The command "export" is used on MacOS, if configuring these values on Windows then replace "export" with "set".

* App creation requires some platform credentials, export these as so from the CLI:
```
export APPCUSER=<Dashboard Username>
export APPCPASS=<Dashboard Password>
```

* Point to the Android SDK location, this is a requirement of Appium:
```
export ANDROID_HOME=<Path/To/Android/SDK>
```

* Point to the Java JDK location, this is a requirement of Appium:
```
export JAVA_HOME=<Path/To/Java/JDK>
```

* Configure the iPhone UDID, we're currently keeping this out of the test config file:
```
export IPHONEUDID=<iPhone UDID>
```

* Configure the Android device ID, we're currently keeping this out of the test config file:
```
export ANDROIDID=<Android Device ID>
```

## Running
`npm run test` - Run the suite.
`npm run clean` - Delete Build artifacts.

## Argument Flags
```
Usage: Test [options]

Options:

  -h, --help                             output usage information
  -p, --platforms <platform1,platform2>  List the platforms that you want to run the suite for. Defaults to 'iOS' and 'Android'.
  -l, --logging <level>                  Set the amount of Output returned by the process, options are 'debug' and 'basic'. Defaults to 'basic'.
  -A, --address <ip>                     The IP address for where the Appium server is. Defaults to localhost
  -r, --release <release_type>           The release type to use, GA or RC. Defaults to to GA
  -P, --port <port>                      The port that the Appium server will run on. Defaults to 4723
  -c, --cli <cli_version>                CLI version to test against. Defaults to latest
  -s, --sdk <sdk_version>                SDK version to test against. Defaults to latest
  -f, --force                            Force rebuild applications.
```
