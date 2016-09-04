//'use strict';
/*jshint esversion: 6 */
/*jslint nomen: true */
// Class definition

var proudOfMyColorsService = (function () {
	//edited July 18, 2016 4:27pm
	//fixed lambda error..
	//edited July 18, 2016 10:14 am
	//added misc..
	'use strict';
	const IDENTITY_POOL = 'us-east-1:2725b0d3-2659-424a-81df-716856217947';
	const USER_POOL_ID = ' us-east-1_zOg5H2KvN';
	const CLIENT_ID = '7qo18h7kmv7qhqljga7q7g20u6';
	const PROVIDER_NAME = 'cognito-idp.us-east-1.amazonaws.com/us-east-1_sXSIoZ4vD';
	const AWS_REGION = 'us-east-1';
	//private properties and methods



	var _creds = new AWS.CognitoIdentityCredentials({
		IdentityPoolId: IDENTITY_POOL
	});

	var _poolData = {
		UserPoolId: USER_POOL_ID,
		ClientId: CLIENT_ID
	};

	// Initialize the Amazon Cognito credentials provider
	AWS.config.region = AWS_REGION; // Region
	AWS.config.credentials = _creds;

	AWSCognito.config.region = AWS_REGION;
	AWSCognito.config.credentials = _creds;

	AWSCognito.config.update({
		accessKeyId: 'anything',
		secretAccessKey: 'anything'
	});

	var _userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(_poolData);
	var _cognitoUser = _userPool.getCurrentUser();





	//private methods
	//Get auth details for lambda authentication
	var _getAuth = function () {
		var auth = {};
		if (_cognitoUser) {
			auth.username = _cognitoUser.username;
			auth.signInUserSession = _cognitoUser.signInUserSession;
			if (_cognitoUser.client &&
				_cognitoUser.client.config &&
				_cognitoUser.client.config.credentials &&
				_cognitoUser.client.config.credentials.params) {
				auth.credentials = _cognitoUser.client.config.credentials.params;
			}
		}
		return auth;
	};




	
	//get session details
	var _updateSession = function (session, callback) {
		if (session && session.isValid()) {
			_creds.params.Logins = {};
			_creds.params.Logins[PROVIDER_NAME] = session.getIdToken().getJwtToken();
			_creds.expired = true;
			console.log(_creds);
		}
	};



	//constructor
	function proudOfMyColorsService(callback) {
		//AWS.config.credentials.get(function (err) {});
		//must run last.  will check if user is valid...
		//this.init = function (callback) {
		var $this = this;
		_cognitoUser = _userPool.getCurrentUser();
		if (_cognitoUser === null) {
			if (callback && typeof callback == "function") {
				callback(null, $this);
			}
			return;
		}
		_cognitoUser.getSession(function (err, session) {
			if (err) {
				console.log(err);
				_cognitoUser.signOut();
				_cognitoUser = null;
				callback(new Error('Account has been expired!. Please login again!')); //   null, $this);
			} else {
				_updateSession(session, function (err, profile) {
					if (callback && typeof callback == "function") {
						callback(err, err ? null : $this);
					}
				});
			}
		});
	}


	

	//public methods
	proudOfMyColorsService.prototype.setCredentials = function (callback) {
		AWS.config.credentials.get(function (err) {
			if (err) {
				console.log(err);
				callback(err);
			} else {
				console.log(_creds);
				callback(null, _creds);
			}
		});

	};

	proudOfMyColorsService.prototype.getUsername = function () {
		if (_cognitoUser === null || _cognitoUser.signInUserSession === null) {
			return null;
		} else {
			return _cognitoUser.getUsername();
		}

	};


	proudOfMyColorsService.prototype.getUser = function (username, callback) {
		getUserData(username, function (err, data) {
			callback(err, data);
		})

	};



	// Instance methods
	proudOfMyColorsService.prototype.signoff = function () {
		if (_cognitoUser !== null) {
			_cognitoUser.signOut();
			_cognitoUser = null;
		}
	};


	proudOfMyColorsService.prototype.signup = function (username, password, email, phone_number, given_name, family_name, gender, callback) {
		var attributeList = [];
		var validationData = [];

		attributeList.push(new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
			Name: 'email',
			Value: email
		}));
		attributeList.push(new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
			Name: 'phone_number',
			Value: '+' + phone_number
		}));

		attributeList.push(new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
			Name: 'given_name',
			Value: given_name
		}));

		attributeList.push(new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
			Name: 'family_name',
			Value: family_name
		}));

		attributeList.push(new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
			Name: 'gender',
			Value: gender
		}));

		//send validation data
		validationData.push(new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
			Name: 'admin',
			Value: _cognitoUser ? _cognitoUser.username : null
		}));
		validationData.push(new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
			Name: 'password',
			Value: password
		}));
		//using attributeList for null...
		_userPool.signUp(username, password, attributeList, validationData, function (err, result) {
			if (err) {
				console.log(err);
				callback(err);
			}
			if (result) {
				_cognitoUser = result.user;
				callback(null, result);
			}
		});
	};


	proudOfMyColorsService.prototype.confirmSignup = function (username, verificationCode, callback) {
		var userData = {
			Username: username,
			Pool: _userPool
		};
		_cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

		_cognitoUser.confirmRegistration(verificationCode, true, function (err, result) {
			callback(err, result);
		});
	};


	proudOfMyColorsService.prototype.signin = function (username, password, callback) {
		var $this = this;
		var trimmedUsername = username.trim();
		console.log(_creds);
		var authenticationData = {
			Username: trimmedUsername,
			Password: password
		};
		var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);

		var userData = {
			Username: trimmedUsername,
			Pool: _userPool
		};
		_cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

		_cognitoUser.authenticateUser(authenticationDetails, {
			onSuccess: function (result) {
				_updateSession(result, function (err, profile) {
					if (err) {
						if (callback && typeof callback == "function")
							callback(err);
					} else {
						if (callback && typeof callback == "function")
							callback(null, $this);
					}
				});

			},
			onFailure: function (err) {
				//_cognitoUser = null;
				if (callback && typeof callback == "function") {
					callback(err, $this);
				}
			}
		});
	};


	//change password for logon user
	proudOfMyColorsService.prototype.changePassword = function (oldPassword, newPassword, callback) {
		_cognitoUser.changePassword(oldPassword, newPassword, function (err, result) {
			console.log('call result: ' + result);
			callback(err);
		});
	};


	//forgot password
	proudOfMyColorsService.prototype.forgotPassword = function (username, callback) {
		var userData = {
			Username: username,
			Pool: _userPool
		};
		_cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
		_cognitoUser.forgotPassword({
			onSuccess: function (result) {
				callback(null, false, result);
			},
			onFailure: function (err) {
				_cognitoUser = null;
				callback(err);
			},
			inputVerificationCode: function () {
				callback(null, true, this);
				/*var verificationCode = prompt('Please input verification code ', '');
				var newPassword = prompt('Enter new password ', '');
				cognitoUser.confirmPassword(verificationCode, newPassword, this);*/
			}
		});
	};

	//confirm-- forgot password
	proudOfMyColorsService.prototype.confirmPassword = function (verificationCode, newPassword, $this) {
		_cognitoUser.confirmPassword(verificationCode, newPassword, $this);
	};


	
	

	//upload document to S#
	proudOfMyColorsService.prototype.uploadToS3 = function (quoteNo, file, name, callback) {
		if (file.type != 'application/pdf') {
			callback(new Error("Only PDF documents allowed"));
			return;
		}
		var newFilename = this.generateRandomCode(8, 4);
		newFilename = newFilename.replace(/[^A-Z0-9]/ig, "_");
		var profile = getStoredProfile();
		var params = {
			Key: 'quotes/' + newFilename + ".pdf",
			ContentType: file.type,
			Body: file,
			ACL: 'private',
			Metadata: {
				"quoteNo": quoteNo,
				"broker": profile.broker,
				"agent": profile.username,
				"document_name": name,
				"original_filename": file.name,
			},
		};
		var _s3 = new AWS.S3({
			params: {
				Bucket: 'ironrockdocuments.courserv.com'
			}
		});
		_s3.putObject(params, function (err, results) {
			callback(err);
		});
	};


	

	//get Broker details----public access
	proudOfMyColorsService.prototype.getProduct = function (code, callback) {
		var dynamodb = new AWS.DynamoDB({
			apiVersion: '2012-08-10'
		});
		var params = {
			TableName: 'IronRockBrokers',
			Key: {
				code: {
					S: code
				}
			}
		};
		dynamodb.getItem(params, function (err, data) {
			if (err) {
				console.log(err);
				callback(err);
			} else {
				console.log(data);
				var result = {};
				if (data.Item) {
					result.code = data.Item.code.S;
					result.name = data.Item.name.S;
					try {
						result.globalName = data.Item.globalName.S;
					} catch (err) {
						result.globalName = '';
					}
					try {
						result.logo = data.Item.logo.S;
					} catch (err) {
						result.logo = '';
					}
				}
				console.log(result);
				callback(null, result);

			}
		});
	};



	//
	return proudOfMyColorsService;
}());
