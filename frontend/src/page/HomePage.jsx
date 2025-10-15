import { Provider } from "react-redux"
import HomeView from "../views/HomeView"
import { UserStore } from "../views/states/UserStore"

const HomePage = () => {
    return(
        <Provider store={UserStore}>
            <HomeView />
        </Provider>
    )
}

export default HomePage;