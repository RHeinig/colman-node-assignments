import { useContext } from "react";
import GlobalContext from "../../contexts/global";
import { useNavigate } from "react-router-dom";
import { removeCookie } from "../../utils/auth";

const Navbar = () => {
    const { user, setUser } = useContext(GlobalContext);
    const navigate = useNavigate();


    const handleLogout = async () => {
        try {
            removeCookie("refreshToken");
            setUser(undefined);
            navigate("/login");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };


    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container">
                <a className="navbar-brand" href="#">Social App</a>

                <ul className="navbar-nav me-auto">
                    {user && (
                        <>
                            <li className="nav-item">
                                <a className="nav-link" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>Home</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>Profile</a>
                            </li>
                        </>
                    )}
                </ul>
                <ul className="navbar-nav">
                    {user && (
                        <li className="nav-item">
                            <a className="nav-link" onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</a>
                        </li>
                    )}
                </ul>
            </div>

        </nav>
    )
}

export default Navbar;