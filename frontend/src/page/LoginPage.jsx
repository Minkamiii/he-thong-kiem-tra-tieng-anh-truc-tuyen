import { Provider } from "react-redux";
import LoginView from "../views/LoginView";
import { UserStore } from "../views/states/UserStore";


const LoginPage = () => {
    return(
        <Provider store={UserStore}>
            <LoginView />
        </Provider>
    );
}

export default LoginPage;