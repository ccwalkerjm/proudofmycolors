//'use strict';
/*jshint esversion: 6 */
/*jslint nomen: true */
// Class definition

var proudOfMyColorsService = (function() {
    //edited July 18, 2016 4:27pm
    //fixed lambda error..
    //edited July 18, 2016 10:14 am
    //added misc..
    'use strict';
    const IDENTITY_POOL = 'us-east-1:2725b0d3-2659-424a-81df-716856217947';
    const USER_POOL_ID = 'us-east-1_zOg5H2KvN';
    const CLIENT_ID = '7qo18h7kmv7qhqljga7q7g20u6';
    const PROVIDER_NAME = 'cognito-idp.us-east-1.amazonaws.com/us-east-1_zOg5H2KvN';
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
    var _getAuth = function() {
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
    var _updateSession = function(session) {
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
        _cognitoUser.getSession(function(err, session) {
            if (err) {
                console.log(err);
                _cognitoUser.signOut();
                _cognitoUser = null;
                callback(new Error('Account has been expired!. Please login again!')); //   null, $this);
            } else {
                _updateSession(session);
                if (callback && typeof callback == "function") {
                    callback(err, err ? null : $this);
                }
            }
        });
    }

    var getSValue = function(value) {
        try {
            return value.S;
        } catch (err) {
            return "";
        }
    };

    var getNValue = function(value) {
        try {
            return value.N;
        } catch (err) {
            return 0;
        }
    };

    var getBaseUrl = function (){
      var getUrl = window.location;
      return getUrl .protocol + "//" + getUrl.host + "/";// + getUrl.pathname.split('/')[1];
    };


    //public methods
    proudOfMyColorsService.prototype.setCredentials = function(callback) {
        AWS.config.credentials.get(function(err) {
            if (err) {
                console.log(err);
                callback(err);
            } else {
                console.log(_creds);
                callback(null, _creds);
            }
        });

    };

    proudOfMyColorsService.prototype.getUsername = function() {
        if (_cognitoUser === null || _cognitoUser.signInUserSession === null) {
            return null;
        } else {
            return _cognitoUser.getUsername();
        }

    };



    // Instance methods
    proudOfMyColorsService.prototype.signoff = function() {
        if (_cognitoUser !== null) {
            _cognitoUser.signOut();
            _cognitoUser = null;
        }
    };


    proudOfMyColorsService.prototype.signup = function(userData, callback) {
        var attributeList = [];

        attributeList.push(new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
            Name: 'email',
            Value: userData.email
        }));
        attributeList.push(new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
            Name: 'phone_number',
            Value: userData.phone_number
        }));

        attributeList.push(new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
            Name: 'given_name',
            Value: userData.given_name
        }));

        attributeList.push(new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
            Name: 'family_name',
            Value: userData.family_name
        }));

        //using attributeList for null...
        _userPool.signUp(userData.username, userData.password, attributeList, null, function(err, result) {
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


    proudOfMyColorsService.prototype.confirmSignup = function(username, verificationCode, callback) {
        var userData = {
            Username: username,
            Pool: _userPool
        };
        _cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

        _cognitoUser.confirmRegistration(verificationCode, true, function(err, result) {
            callback(err, result);
        });
    };


    proudOfMyColorsService.prototype.signin = function(username, password, callback) {
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
            onSuccess: function(result) {
                _updateSession(result);
                callback(null, $this);
            },
            onFailure: function(err) {
                //_cognitoUser = null;
                callback(err);
            }
        });
    };


    //change password for logon user
    proudOfMyColorsService.prototype.changePassword = function(oldPassword, newPassword, callback) {
        _cognitoUser.changePassword(oldPassword, newPassword, function(err, result) {
            console.log('call result: ' + result);
            callback(err);
        });
    };


    //forgot password
    proudOfMyColorsService.prototype.forgotPassword = function(username, callback) {
        var userData = {
            Username: username,
            Pool: _userPool
        };
        _cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
        _cognitoUser.forgotPassword({
            onSuccess: function(result) {
                callback(null, false, result);
            },
            onFailure: function(err) {
                _cognitoUser = null;
                callback(err);
            },
            inputVerificationCode: function() {
                callback(null, true, this);
            }
        });
    };

    //confirm-- forgot password
    proudOfMyColorsService.prototype.confirmPassword = function(verificationCode, newPassword, $this) {
        _cognitoUser.confirmPassword(verificationCode, newPassword, $this);
    };


    var lambdaJsonValue = function(data) {
        return JSON.parse(data.Payload);
    };


    //admin only
    proudOfMyColorsService.prototype.listUsers = function(callback) {
        var jsonRequest = {};
        jsonRequest.request = {
            'cmd': 'listUsers'
        };
        jsonRequest.auth = _getAuth();
        var requestSerialized = JSON.stringify(jsonRequest);
        var params = {
            FunctionName: 'proudofmycolorsAdminFunc',
            Payload: requestSerialized
        };
        var _lambda = new AWS.Lambda();
        _lambda.invoke(params, function(err, results) {
            callback(err, results);
        });
    };

    //admin functions
    //get user
    proudOfMyColorsService.prototype.createProduct = function(data, callback) {
        var jsonRequest = {};
        jsonRequest.request = {
            'cmd': 'createProduct',
            'data': data
        };
        jsonRequest.auth = _getAuth();
        var requestSerialized = JSON.stringify(jsonRequest);
        var params = {
            FunctionName: 'proudofmycolorsAdminFunc',
            Payload: requestSerialized
        };
        var _lambda = new AWS.Lambda();
        _lambda.invoke(params, function(err, results) {
            callback(err);
        });
    };

    proudOfMyColorsService.prototype.updateProduct = function(data, callback) {
        var jsonRequest = {};
        jsonRequest.request = {
            'cmd': 'updateProduct',
            'data': data
        };
        jsonRequest.auth = _getAuth();
        var requestSerialized = JSON.stringify(jsonRequest);
        var params = {
            FunctionName: 'proudofmycolorsAdminFunc',
            Payload: requestSerialized
        };
        var _lambda = new AWS.Lambda();
        _lambda.invoke(params, function(err, results) {
            callback(err);
        });
    };

    //
    proudOfMyColorsService.prototype.deleteProduct = function(id, callback) {
        var jsonRequest = {};
        jsonRequest.request = {
            'cmd': 'deleteProduct',
            'id': id
        };
        jsonRequest.auth = _getAuth();
        var requestSerialized = JSON.stringify(jsonRequest);
        var params = {
            FunctionName: 'proudofmycolorsAdminFunc',
            Payload: requestSerialized
        };
        var _lambda = new AWS.Lambda();
        _lambda.invoke(params, function(err, results) {
            callback(err);
        });
    };



    //public acccess
    //get Product details----public access
    proudOfMyColorsService.prototype.listProducts = function(callback) {
        var dynamodb = new AWS.DynamoDB({
            apiVersion: '2012-08-10'
        });
        var params = {
            TableName: 'proudofmycolors_products'
        };
        dynamodb.scan(params, function(err, data) {
            if (err) {
                console.log(err);
                callback(err);
            } else {
                console.log(data);
                var list = [];
                for (var i = 0; i < data.Items.length; i++) {
                    var result = {};
                    result.id = data.Items[i].id.N;
                    result.productName = data.Items[i].productName.S;
                    result.country = getSValue(data.Items[i].country);
                    result.gender = getSValue(data.Items[i].gender);
                    result.price = getNValue(data.Items[i].price);
                    result.smallImageName = getSValue(data.Items[i].smallImageName);
                    result.largeImageName = getSValue(data.Items[i].largeImageName);
                    result.description = getSValue(data.Items[i].description);
                    result.availability = getNValue(data.Items[i].availability);



                    list.push(result);
                }
                callback(null, list);
            }
        });
    };


    //get Product details----public access
    proudOfMyColorsService.prototype.getProduct = function(id, callback) {
        var dynamodb = new AWS.DynamoDB({
            apiVersion: '2012-08-10'
        });
        var params = {
            TableName: 'proudofmycolors_products',
            Key: {
                id: {
                    N: id
                }
            }
        };

        dynamodb.getItem(params, function(err, data) {
            if (err) {
                console.log(err);
                callback(err);
            } else {
                console.log(data);
                var result = {};
                if (data.Item) {
                    result.id = data.Item.id.N;
                    result.productName = data.Item.productName.S ? data.Item.productName.S : '';
                    result.smallImageName = data.Item.smallImageName ? data.Item.smallImageName.S : '';
                    result.largeImageName = data.Item.largeImageName ? data.Item.largeImageName.S : '';
                    result.description = getSValue(data.Item.description);
                    result.gender = getSValue(data.Item.gender);
                    result.availability = getNValue(data.Item.availability);
                    result.price = getNValue(data.Item.price);
                    result.country = getSValue(data.Item.country);
                }
                console.log(result);
                callback(null, result);

            }
        });
    };

    //checkout ---return token
    proudOfMyColorsService.prototype.paypalCheckout = function(method,data, callback) {
        var request = {};
        request.data = data;
        request.method = method;
        request.baseUrl = getBaseUrl();
        var requestSerialized = JSON.stringify(request);
        var params = {
            FunctionName: 'pomyc_set_checkout',
            Payload: requestSerialized
        };
        var _lambda = new AWS.Lambda();
        _lambda.invoke(params, function(err, results) {
            callback(err, results);
        });
    };


    //
    return proudOfMyColorsService;
}());
