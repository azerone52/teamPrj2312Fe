import axios from "axios";

export const startSocialLoginTimer = async (
  accessTokenExpiry,
  refreshThreshold,
  setIsSocial,
  toast,
  navigate,
) => {
  console.log("========== 소셜 로그인 멤버입니다 ==========");
  console.log("==========" + new Date() + "==========");

  let countdownTimer;

  const startCountdownTimer = async (expiresIn) => {
    countdownTimer = setInterval(
      async () => {
        await RefreshSocialAccessToken();
      },
      (expiresIn - refreshThreshold) * 1000,
    );
  };

  const RefreshSocialAccessToken = async () => {
    try {
      console.log("백엔드에 갱신 요청");
      const response = await axios.get("/api/auth/refreshToken", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("refreshToken")}`,
        },
      });

      if (response.status === 204) {
        setIsSocial(false);
      } else {
        const newExpiresIn = response.data;
        console.log("expiresIn:", newExpiresIn);
        await startCountdownTimer(newExpiresIn);
      }
    } catch (error) {
      toast({
        description: "다시 로그인해주세요.",
        status: "error",
      });
      console.log(error.response.data);
      navigate("/login");
    }
  };

  await startCountdownTimer(accessTokenExpiry);
  console.log("========== 소셜 로그인 멤버 검증 완료 ==========");

  return () => clearInterval(countdownTimer);
};
