import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Login() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const newUser = params.get("newUser");
    const verify = params.get("verify");

    console.log(newUser, verify);
    // Test UI cho trường hợp login
    // Dựa vào newUser và verify để biết là user mới hay cũ và đã verify mail hay chưa
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    navigate("/");
  }, [params]);
  return <div>Login</div>;
}
