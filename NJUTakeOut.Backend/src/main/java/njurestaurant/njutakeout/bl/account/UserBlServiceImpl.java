package njurestaurant.njutakeout.bl.account;

import net.sf.json.JSONObject;
import njurestaurant.njutakeout.blservice.account.UserBlService;
import njurestaurant.njutakeout.dataservice.account.UserDataService;
import njurestaurant.njutakeout.entity.account.User;
import njurestaurant.njutakeout.exception.*;
import njurestaurant.njutakeout.publicdatas.account.Role;
import njurestaurant.njutakeout.response.user.AvatarSaveResponse;
import njurestaurant.njutakeout.response.user.OpenIdAndSessionKeyResponse;
import njurestaurant.njutakeout.response.user.PhoneNumberGetResponse;
import njurestaurant.njutakeout.response.user.UserLoginResponse;
import njurestaurant.njutakeout.security.jwt.JwtService;
import njurestaurant.njutakeout.security.jwt.JwtUser;
import njurestaurant.njutakeout.security.jwt.JwtUserDetailsService;
import njurestaurant.njutakeout.util.AESDecodeUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;

@Service
public class UserBlServiceImpl implements UserBlService {

    private final static long EXPIRATION = 604800;
    private final static String USER_DEFAULT_PASSWORD = "user";

    private final UserDataService userDataService;
    private final JwtUserDetailsService jwtUserDetailsService;
    private final JwtService jwtService;

    @Value(value = "${wechat.url}")
    private String wechatUrl;

    @Value(value = "${wechat.id}")
    private String appId;

    @Value(value = "${wechat.secret}")
    private String appSecret;

    @Autowired
    public UserBlServiceImpl(UserDataService userDataService, JwtUserDetailsService jwtUserDetailsService, JwtService jwtService) {
        this.userDataService = userDataService;
        this.jwtUserDetailsService = jwtUserDetailsService;
        this.jwtService = jwtService;
    }

    /**
     * login
     *
     * @param username the username of the user
     * @param password the password of the user
     * @return the login info to response
     * @throws WrongUsernameOrPasswordException the username or password is error
     */
    @Override
    public UserLoginResponse login(String username, String password) throws WrongUsernameOrPasswordException, CannotRegisterException {
        if (username.length() == 0) {
            throw new CannotRegisterException();
        }
        if (password.equals(USER_DEFAULT_PASSWORD)) {
            if (!userDataService.isUserExistent(username)) {
                userDataService.saveUser(new User("", username, password, Role.USER, new ArrayList<>(), new ArrayList<>()));
            }
            JwtUser jwtUser = (JwtUser) jwtUserDetailsService.loadUserByUsername(username);
            String token = jwtService.generateToken(jwtUser, EXPIRATION);
            return new UserLoginResponse(token);
        } else {
            if (userDataService.confirmPassword(username, password)) {
                JwtUser jwtUser = (JwtUser) jwtUserDetailsService.loadUserByUsername(username);
                String token = jwtService.generateToken(jwtUser, EXPIRATION);
                return new UserLoginResponse(token);
            } else {
                throw new WrongUsernameOrPasswordException();
            }
        }
    }

    /**
     * get user openid
     *
     * @param jsCode wechat js code
     * @return whether the operation is success or not
     */
    @Override
    public OpenIdAndSessionKeyResponse getOpenIdAndSessionKey(String jsCode) throws CannotGetOpenIdAndSessionKeyException {
        RestTemplate client = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON_UTF8);
        HttpEntity<String> entity = new HttpEntity<String>("", headers);
        ResponseEntity<String> response = client.exchange(wechatUrl + appId + "&secret=" + appSecret + "&js_code=" + jsCode + "&grant_type=authorization_code", HttpMethod.GET, entity, String.class);
        if (response.getStatusCode() == HttpStatus.OK) {
            return new OpenIdAndSessionKeyResponse((String) JSONObject.fromObject(response.getBody()).get("openid"), (String) JSONObject.fromObject(response.getBody()).get("session_key"));
        } else {
            throw new CannotGetOpenIdAndSessionKeyException();
        }
    }

    /**
     * register
     *
     * @param username
     * @param password
     * @return
     */
    @Override
    public UserLoginResponse register(String username, String password) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        userDataService.saveUser(new User("", username, encoder.encode(password), Role.RESTAURANT, new ArrayList<>(), new ArrayList<>()));
        JwtUser jwtUser = (JwtUser) jwtUserDetailsService.loadUserByUsername(username);
        String token = jwtService.generateToken(jwtUser, EXPIRATION);
        return new UserLoginResponse(token);
    }

    /**
     * decrypt data
     *
     * @param encryptData
     * @param sessionKey
     * @param ivCode
     * @return
     */
    @Override
    public PhoneNumberGetResponse decryptData(String encryptData, String sessionKey, String ivCode) throws PhoneNumberGetWrongException {
        try {
            return new PhoneNumberGetResponse(AESDecodeUtils.decrypt(sessionKey, ivCode, encryptData));
        } catch (Exception e) {
            e.printStackTrace();
            throw new PhoneNumberGetWrongException();
        }
    }

    /**
     * save avatar to a user
     *
     * @param username
     * @param avatarUrl
     */
    @Override
    public AvatarSaveResponse saveAvatar(String username, String avatarUrl) throws UsernameDoesNotFoundException {
        User user = userDataService.getUserByUsername(username);
        if (user == null) {
            throw new UsernameDoesNotFoundException();
        } else {
            user.setAvatarUrl(avatarUrl);
            userDataService.saveUser(user);
            return new AvatarSaveResponse();
        }
    }
}
