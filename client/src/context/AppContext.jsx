import { createContext,useState,useEffect } from 'react'; // Import createContext from React
import { toast } from 'react-toastify';
import axios from 'axios';


// Create a context
export const AppContext = createContext();

// Create a context provider component
export const AppContextProvider = (props) => {
    
     axios.defaults.withCredentials = true; // Enable axios to send cookies

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(false);
 
    const getAuthState = async ()=>{
        try{
            const {data} = await axios.get(backendUrl+'/api/auth/is-auth');
            if(data.success){
                setIsLoggedIn(true)
                getUserData()
            }
        }
        catch(e){
            toast.error(e.message)
        }
    }   

    const getUserData = async () => {
        try{
            const {data} = await axios.get(backendUrl+'/api/user/data');
            data.success?setUserData(data.userData):toast.error(data.message)
        }
        catch(e){
            toast.error(e.message)
    }}

    useEffect(()=>{
        getAuthState();
    },[])

    // Define the value that will be provided to the context consumers
    const value = {
        backendUrl,
        isLoggedIn,
        setIsLoggedIn,
        userData,
        setUserData,
        getUserData
        
    };

    return (
        // Provide the context value to the children components
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
}