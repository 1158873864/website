package njurestaurant.njutakeout.data.dao.account;

import njurestaurant.njutakeout.entity.account.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserDao extends JpaRepository<User, String> {
    User findUserByUsername(String username);
}
