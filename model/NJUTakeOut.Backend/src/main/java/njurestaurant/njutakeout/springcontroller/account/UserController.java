package njurestaurant.njutakeout.springcontroller.account;

import io.swagger.annotations.*;
import njurestaurant.njutakeout.blservice.account.UserBlService;
import njurestaurant.njutakeout.exception.*;
import njurestaurant.njutakeout.parameters.user.AvatarSaveParameters;
import njurestaurant.njutakeout.parameters.user.PhoneNumberGetParameters;
import njurestaurant.njutakeout.response.Response;
import njurestaurant.njutakeout.response.WrongResponse;
import njurestaurant.njutakeout.response.user.UserLoginResponse;
import njurestaurant.njutakeout.util.UserInfoUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class UserController {
    private final UserBlService userBlService;

    @Autowired
    public UserController(UserBlService userBlService) {
        this.userBlService = userBlService;
    }

    @ApiOperation(value = "用户登录", notes = "验证用户登录并返回token")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "username", value = "用户名", required = true, dataType = "String"),
            @ApiImplicitParam(name = "password", value = "密码", required = true, dataType = "String")
    })
    @RequestMapping(value = "account/login", method = RequestMethod.GET)
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Success", response = UserLoginResponse.class),
            @ApiResponse(code = 401, message = "Unauthorized", response = WrongResponse.class),
            @ApiResponse(code = 500, message = "Failure", response = WrongResponse.class)})
    @ResponseBody
    public ResponseEntity<Response> login(
            @RequestParam("username") String username, @RequestParam("password") String password) {
        try {
            UserLoginResponse userLoginResponse = userBlService.login(username, password);
            return new ResponseEntity<>(userLoginResponse, HttpStatus.OK);
        } catch (WrongUsernameOrPasswordException e) {
            e.printStackTrace();
            return new ResponseEntity<>(e.getResponse(), HttpStatus.UNAUTHORIZED);
        } catch (CannotRegisterException e) {
            e.printStackTrace();
            return new ResponseEntity<>(e.getResponse(), HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @ApiOperation(value = "用户注册", notes = "管理员注册用户")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "username", value = "用户名", required = true, dataType = "String"),
            @ApiImplicitParam(name = "password", value = "密码", required = true, dataType = "String")
    })
    @RequestMapping(value = "account/register", method = RequestMethod.GET)
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Success", response = UserLoginResponse.class),
            @ApiResponse(code = 401, message = "Unauthorized", response = WrongResponse.class),
            @ApiResponse(code = 500, message = "Failure", response = WrongResponse.class)})
    @ResponseBody
    public ResponseEntity<Response> register(
            @RequestParam("username") String username, @RequestParam("password") String password) {
        UserLoginResponse userLoginResponse = userBlService.register(username, password);
        return new ResponseEntity<>(userLoginResponse, HttpStatus.OK);
    }

    @ApiOperation(value = "获得微信openid", notes = "获得微信openid")
    @RequestMapping(method = RequestMethod.POST, path = "/getOpenId", produces = "application/json")
    @ResponseBody
    public ResponseEntity<Response> getOpenId(@RequestParam("jsCode") String jsCode) {
        try {
            return new ResponseEntity<>(userBlService.getOpenIdAndSessionKey(jsCode), HttpStatus.OK);
        } catch (CannotGetOpenIdAndSessionKeyException e) {
            e.printStackTrace();
            return new ResponseEntity<>(e.getResponse(), HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @ApiOperation(value = "获得手机号码", notes = "获得手机号码")
    @RequestMapping(method = RequestMethod.POST, path = "/getPhoneNumber", produces = "application/json")
    @ResponseBody
    public ResponseEntity<Response> getPhoneNumber(@RequestBody PhoneNumberGetParameters phoneNumberGetParameters) {
        try {
            return new ResponseEntity<>(userBlService.decryptData(phoneNumberGetParameters.getEncryptData(), phoneNumberGetParameters.getSessionKey(), phoneNumberGetParameters.getIvCode()), HttpStatus.OK);
        } catch (PhoneNumberGetWrongException e) {
            e.printStackTrace();
            return new ResponseEntity<>(e.getResponse(), HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @ApiOperation(value = "保存用户头像", notes = "提交订单工程中保存用户头像")
    @RequestMapping(method = RequestMethod.POST, path = "/saveAvatar", produces = "application/json")
    @ResponseBody
    public ResponseEntity<Response> saveAvatar(@RequestBody AvatarSaveParameters avatarSaveParameters) {
        try {
            return new ResponseEntity<>(userBlService.saveAvatar(UserInfoUtil.getUsername(), avatarSaveParameters.getAvatarUrl()), HttpStatus.OK);
        } catch (UsernameDoesNotFoundException e) {
            e.printStackTrace();
            return new ResponseEntity<>(e.getResponse(), HttpStatus.NOT_FOUND);
        }
    }
}
