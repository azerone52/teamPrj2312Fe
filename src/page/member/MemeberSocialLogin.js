import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import axios from "axios";

export function MemeberSocialLogin() {
  let { type } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    axios
      .get(`/api/auth/${type}/callback?` + searchParams)
      .then((response) => {
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        toast({
          description: "로그인 되었습니다.",
          status: "success",
        });
        navigate("/");
      })
      .catch(() => {
        toast({
          description: "소셜 로그인 중 에러가 발생했습니다.",
          status: "error",
        });
        navigate("/login");
      });
  }, []);

  return null;
}
