//'use strict';
/*jshint esversion: 6 */
/*jslint nomen: true */
// Class definition

var courserv_web_service = (function() {
    //created October 3, 2016
    'use strict';
    const IDENTITY_POOL = 'us-east-1:ae6eb452-cb15-421c-b0e3-0279c239235a';
    const USER_POOL_ID = 'us-east-1_WPOO9sn0r';
    const CLIENT_ID = '5006ojp6nu600vt64p4i31kvij';

    const AWS_REGION = 'us-east-1';
    //private properties and methods
    var _profile;

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

    //services
    var _lambda = new AWS.Lambda();
    var _dynamodb = new AWS.DynamoDB({
        apiVersion: '2012-08-10'
    });




    //private methods
    //Get auth details for lambda authentication
    var _getAuth = function() {
        var auth = {};
        if (_cognitoUser) {
            auth.username = _cognitoUser.username;
            auth.signInUserSession = _cognitoUser.signInUserSession;
        }
        return auth;
    };

    //set Credentials
    var _setCredentials = function(session, callback) {
        if (session && session.isValid()) {
            var idToken = session.getIdToken().getJwtToken();
            var provider_name = 'cognito-idp.' + AWS_REGION + '.amazonaws.com/' + USER_POOL_ID;
            _creds.params.Logins = {};
            _creds.params.Logins[provider_name] = idToken;
            _creds.expired = true;
            //AWS.config.credentials = _creds;
            //AWSCognito.config.credentials = _creds;
            console.log(_creds);
            _profile = parseJwt(idToken);
            if (AWS.config.credentials.needsRefresh()) {
                AWS.config.credentials.refresh(function(err) {
                    console.log(_creds);
                    callback(err);
                });
            } else {
                callback();
            }
        } else {
            callback();
        }
    };


    //transform dynamodb fields
    function getS(value) {
        try {
            return value.S;
        } catch (err) {
            return "";
        }
    }

    function getN(value) {
        try {
            return value.N;
        } catch (err) {
            return 0;
        }
    }


    function getBool(value) {
        try {
            var valueN = parseInt(value.N);
            return valueN == 1;
        } catch (err) {
            return false;
        }
    }

    function parseJwt(token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(window.atob(base64));
    }

    var logout = function() {
        _cognitoUser.signOut();
        _cognitoUser = null;
        AWS.config.credentials.clearCachedId();
    };

    //constructor
    function courserv_web_service(callback) {
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
                logout();
                callback(new Error('Account has expired!. Please login again!')); //   null, $this);
            } else {
                _setCredentials(session, function(err) {
                    if (callback && typeof callback == "function") {
                        callback(err, $this);
                    }
                });
            }
        });
    }


    var getBaseUrl = function() {
        var getUrl = window.location;
        return getUrl.protocol + "//" + getUrl.host + "/"; // + getUrl.pathname.split('/')[1];
    };


    //public methods
    courserv_web_service.prototype.setCredentials = function(callback) {
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


    courserv_web_service.prototype.getProfile = function() {
        return _profile;
    };

    courserv_web_service.prototype.getUsername = function() {
        if (_cognitoUser === null || _cognitoUser.signInUserSession === null) {
            return null;
        } else {
            return _cognitoUser.getUsername();
        }

    };



    // Instance methods
    courserv_web_service.prototype.signoff = function() {
        if (_cognitoUser !== null) {
            logout();
        }
    };


    courserv_web_service.prototype.signup = function(userData, callback) {
        var attributeList = [];

        attributeList.push(new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
            Name: 'email',
            Value: userData.email
        }));
        attributeList.push(new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
            Name: 'birthdate',
            Value: userData.birthdate
        }));
        attributeList.push(new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
            Name: 'gender',
            Value: userData.gender
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


    courserv_web_service.prototype.confirmSignup = function(username, verificationCode, callback) {
        var userData = {
            Username: username,
            Pool: _userPool
        };
        _cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

        _cognitoUser.confirmRegistration(verificationCode, true, function(err, result) {
            callback(err, result);
        });
    };


    courserv_web_service.prototype.signin = function(username, password, callback) {
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
                _setCredentials(result, function(err) {
                    callback(err, $this);
                });
            },
            onFailure: function(err) {
                //_cognitoUser = null;
                callback(err);
            }
        });
    };


    //change password for logon user
    courserv_web_service.prototype.changePassword = function(oldPassword, newPassword, callback) {
        _cognitoUser.changePassword(oldPassword, newPassword, function(err, result) {
            console.log('call result: ' + result);
            callback(err);
        });
    };


    //forgot password
    courserv_web_service.prototype.forgotPassword = function(username, callback) {
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
    courserv_web_service.prototype.confirmPassword = function(verificationCode, newPassword, $this) {
        _cognitoUser.confirmPassword(verificationCode, newPassword, $this);
    };


    var lambdaJsonValue = function(data) {
        return JSON.parse(data.Payload);
    };


    //admin only
    courserv_web_service.prototype.getSite = function(domainKey, callback) {
        var jsonRequest = {};
        jsonRequest.request = {};
        jsonRequest.request.cmd = 'getSite';
        jsonRequest.request.domainKey = domainKey;
        jsonRequest.auth = _getAuth();
        var params = {
            FunctionName: 'courserv_manage_site',
            Payload: JSON.stringify(jsonRequest)
        };
        _lambda.invoke(params, function(err, data) {
            if (err) {
                callback(err);
            } else {
                var item = {};
                if (data.Payload) {
                    data = JSON.parse(data.Payload);
                    if (data.errorMessage) return callback(new Error(data.errorMessage));
                    if (!data.Item) return callback(new Error("No Data"));
                    item.name = getS(data.Item.name);
                    item.description = getS(data.Item.description);
                    item.domainKey = getS(data.Item.domainKey);
                    item.bucket = getS(data.Item.bucket);
                    item.type = getS(data.Item.type);
                    item.prefix = getS(data.Item.prefix);
                    if (data.Item.paypalCredentials) {
                        item.paypal = {};
                        item.paypal.username = data.Item.paypalCredentials.M.username.S;
                        item.paypal.password = data.Item.paypalCredentials.M.password.S;
                        item.paypal.signature = data.Item.paypalCredentials.M.signature.S;
                        item.paypal.live = data.Item.paypalCredentials.M.live.BOOL;
                    }
                }
                callback(null, item);
            }
        });
    };

    courserv_web_service.prototype.listSites = function(callback) {
        var jsonRequest = {};
        jsonRequest.request = {
            'cmd': 'listSites'
        };
        jsonRequest.auth = _getAuth();
        var params = {
            FunctionName: 'courserv_manage_site',
            Payload: JSON.stringify(jsonRequest)
        };
        _lambda.invoke(params, function(err, data) {
            if (err) {
                callback(err);
            } else {
                callback(null, data.Payload);
            }
        });
    };

    courserv_web_service.prototype.createSite = function(data, callback) {
        var jsonRequest = {};
        jsonRequest.request = {};
        jsonRequest.request.cmd = 'createSite';
        jsonRequest.request.data = data;
        jsonRequest.auth = _getAuth();
        var params = {
            FunctionName: 'courserv_manage_site',
            Payload: JSON.stringify(jsonRequest)
        };
        _lambda.invoke(params, function(err, data) {
            if (err) {
                callback(err);
            } else {
                callback(null, data.Payload);
            }
        });
    };

    //update paypal credentials
    courserv_web_service.prototype.updatePaypal = function(domainKey, paypal, callback) {
        var jsonRequest = {};
        jsonRequest.request = {};
        jsonRequest.request.cmd = 'updatePaypal';
        jsonRequest.request.data = {};
        jsonRequest.request.data.domainKey = domainKey;
        jsonRequest.request.data.paypal = paypal;
        jsonRequest.auth = _getAuth();
        var params = {
            FunctionName: 'courserv_manage_site',
            Payload: JSON.stringify(jsonRequest)
        };
        _lambda.invoke(params, function(err, data) {
            if (err) {
                callback(err);
            } else {
                callback(null, data.Payload);
            }
        });
    };

    //upload site to S#
    courserv_web_service.prototype.uploadSite = function(domainKey, file, callback) {
        if (file.type != 'application/zip' && file.type != 'application/x-zip-compressed') {
            callback(new Error("Only ZIP File allowed"));
            return;
        }
        var token = _getAuth().signInUserSession.accessToken.jwtToken;
        var params = {
            Key: 'files/' + domainKey + ".zip",
            ContentType: file.type,
            Body: file,
            ACL: 'private',
            Metadata: {
                "x-amz-meta-domainKey": domainKey,
                "x-amz-meta-token": token,
            },
        };
        var _s3 = new AWS.S3({
            params: {
                Bucket: 'zipsite.courserv.com'
            }
        });
        _s3.putObject(params, function(err, results) {
            callback(err);
        });
    };


    //admin only
    courserv_web_service.prototype.listUsers = function(domainKey, callback) {
        var jsonRequest = {};
        jsonRequest.request = {
            'cmd': 'listUsers',
            'domainKey': domainKey
        };
        jsonRequest.auth = _getAuth();
        var requestSerialized = JSON.stringify(jsonRequest);
        var params = {
            FunctionName: 'courserv_manage_site',
            Payload: requestSerialized
        };
        _lambda.invoke(params, function(err, data) {
            if (err) {
                callback(err);
            } else {
                callback(null, data.Payload);
            }
        });
    };

    //admin functions
    //get user
    var jsonRequest = {};
    courserv_web_service.prototype.createProduct = function(domainKey, data, callback) {
        var jsonRequest = {};
        jsonRequest.request = {
            'cmd': 'createProduct',
            'data': data,
            'domainKey': domainKey
        };
        jsonRequest.auth = _getAuth();
        var requestSerialized = JSON.stringify(jsonRequest);
        var params = {
            FunctionName: 'courserv_manage_site',
            Payload: requestSerialized
        };
        _lambda.invoke(params, function(err, data) {
            callback(err);
        });
    };

    courserv_web_service.prototype.updateProduct = function(domainKey, data, callback) {
        var jsonRequest = {};
        jsonRequest.request = {
            'cmd': 'updateProduct',
            'data': data,
            'domainKey': domainKey
        };
        jsonRequest.auth = _getAuth();
        var requestSerialized = JSON.stringify(jsonRequest);
        var params = {
            FunctionName: 'courserv_manage_site',
            Payload: requestSerialized
        };
        _lambda.invoke(params, function(err, data) {
            callback(err);
        });
    };

    //
    courserv_web_service.prototype.deleteProduct = function(domainKey, productId,  callback) {
        var jsonRequest = {};
        jsonRequest.request = {
            'cmd': 'deleteProduct',
            'productId': productId,
            'domainKey': domainKey
        };
        jsonRequest.auth = _getAuth();
        var requestSerialized = JSON.stringify(jsonRequest);
        var params = {
            FunctionName: 'courserv_manage_site',
            Payload: requestSerialized
        };
        _lambda.invoke(params, function(err, data) {
            callback(err);
        });
    };



    //public acccess
    //get Product details----public access
    courserv_web_service.prototype.listProducts = function(domainKey, callback) {
        var params = {
            TableName: 'courserv_products',
            KeyConditionExpression: "#keyName = :keyval",
            ExpressionAttributeNames: {
                "#keyName": 'domainKey',
            },
            ExpressionAttributeValues: {
                ":keyval": {
                    "S": domainKey
                },

            },
        };
        _dynamodb.query(params, function(err, data) {
            if (err) {
                console.log(err);
                callback(err);
            } else {
                console.log(data);
                var list = [];
                for (var i = 0; i < data.Items.length; i++) {
                    var result = {};
                    result.productId = data.Items[i].productId.N;
                    result.productName = data.Items[i].productName.S;
                    result.country = getS(data.Items[i].country);
                    result.gender = getS(data.Items[i].gender);
                    result.price = getN(data.Items[i].price);
                    result.smallImageName = getS(data.Items[i].smallImageName);
                    result.largeImageName = getS(data.Items[i].largeImageName);
                    result.description = getS(data.Items[i].description);
                    result.availability = getN(data.Items[i].availability);

                    list.push(result);
                }
                callback(null, list);
            }
        });
    };


    //get Product details----public access
    courserv_web_service.prototype.getProduct = function(domainKey, productId, callback) {
        var params = {
            TableName: 'courserv_products',
            Key: {
                domainKey: {
                    S: domainKey
                },
                productId: {
                    N: productId.toString()
                }
            }
        };

        _dynamodb.getItem(params, function(err, data) {
            if (err) {
                console.log(err);
                callback(err);
            } else {
                console.log(data);
                var result = {};
                if (data.Item) {
                    result.productId = data.Item.productId.N;
                    result.productName = data.Item.productName.S ? data.Item.productName.S : '';
                    result.smallImageName = data.Item.smallImageName ? data.Item.smallImageName.S : '';
                    result.largeImageName = data.Item.largeImageName ? data.Item.largeImageName.S : '';
                    result.description = getS(data.Item.description);
                    result.gender = getS(data.Item.gender);
                    result.availability = getN(data.Item.availability);
                    result.price = getN(data.Item.price);
                    result.country = getS(data.Item.country);
                }
                console.log(result);
                callback(null, result);

            }
        });
    };

    //checkout ---return token
    courserv_web_service.prototype.paypalCheckout = function(method, data, domainKey, callback) {
        var request = {};
        request.data = data;
        request.method = method;
        request.baseUrl = getBaseUrl();
        request.auth = _getAuth();
        request.domainKey = domainKey;
        var requestSerialized = JSON.stringify(request);
        var params = {
            FunctionName: 'courserv_paypal_checkout',
            Payload: requestSerialized
        };
        _lambda.invoke(params, function(err, data) {
            if (err) {
                callback(err);
            } else {
                callback(null, data.Payload);
            }
        });
    };

    //invite user
    courserv_web_service.prototype.inviteUser = function(userInvite, callback) {
        var jsonRequest = {};
        jsonRequest.request = {
            'cmd': 'inviteUser',
            'data': userInvite
        };
        jsonRequest.auth = _getAuth();
        var requestSerialized = JSON.stringify(jsonRequest);
        var params = {
            FunctionName: 'courserv_manage_site',
            Payload: requestSerialized
        };
        _lambda.invoke(params, function(err, data) {
            callback(err);
        });
    };

    //
    return courserv_web_service;
}());
