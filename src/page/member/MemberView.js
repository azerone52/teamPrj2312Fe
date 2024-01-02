import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export function MemberView() {
  const [member, setMember] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();
  const [orderNames, setOrderNames] = useState([]);

  function getMember() {
    const accessToken = localStorage.getItem("accessToken");
    console.log("엑세스 토큰", accessToken);
    axios
      .get("/member", { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((response) => {
        console.log("getMember()의 then 실행");
        console.log(response.data);
        setMember(response.data);
        return axios.get(`/member/${response.data.logId}/orders`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      })
      .then((response) => {
        setOrderNames(response.data);
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          console.log("getMember()의 catch 실행");
          localStorage.removeItem("accessToken");
          sendRefreshToken();
          console.log("sendRefreshToken 호출");
        } else if (error.response && error.response.status === 403) {
          toast({
            description: "접근이 거부되었습니다",
            status: "error",
          });
          console.log("403에러!!!");
        } else {
          toast({
            description: "오류가 발생했습니다",
            status: "error",
          });
          console.log("그 외 에러");
        }
      });
  }
  // 주문 이름들을 표시하는 폼 컨트롤
  const orderNameControls = orderNames.map((orderName, index) => (
    <FormControl key={index}>
      <FormLabel>Order Name {index + 1}</FormLabel>
      <Input type="text" value={orderName} readOnly />
    </FormControl>
  ));

  function sendRefreshToken() {
    const refreshToken = localStorage.getItem("refreshToken");
    console.log("리프레시 토큰: ", refreshToken);

    axios
      .get("/refreshToken", {
        headers: { Authorization: `Bearer ${refreshToken}` },
      })
      .then((response) => {
        console.log("sendRefreshToken()의 then 실행");
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);

        console.log("토큰들 업데이트 리프레시 토큰: ");
        console.log(response.data.refreshToken);
        getMember();
      })
      .catch((error) => {
        console.log("sendRefreshToken()의 catch 실행");
        localStorage.removeItem("refreshToken");
        //navigate("/login");
        toast({
          description: "권한이 없습니다",
          status: "warning",
        });
        navigate("/login");
      });
  }

  useEffect(() => {
    getMember();
  }, []);

  if (member === null) {
    return <Spinner />;
  }

  function handleDelete() {
    axios
      .delete("/member/delete/" + member.id, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        console.log("회원 탈퇴 성공");
      })
      .catch(() => console.log("회원 탈퇴 실패"))
      .finally(() => {
        console.log("해치웠나");
        onClose();
        navigate("/");
        // 페이지 새로고침
        window.location.reload();
      });
    //   axios.delete().then().catch();
    // 홈 화면으로 이동시킬 것
  }

  const formattedEmail = () => {
    const email = member.email;

    if (email) {
      const [username, domain] = email.split("@");
      const maskedUsername =
        username.slice(0, 2) + "*".repeat(username.length - 2);
      return `${maskedUsername}@${domain}`;
    }
    return "";
  };

  return (
    <Box>
      <Heading>{member.logId}님 정보</Heading>
      <FormControl>
        <FormLabel>name</FormLabel>
        <Input value={member.name} readOnly />
      </FormControl>
      <FormControl>
        <FormLabel>address</FormLabel>
        <Input type="text" value={member.address} readOnly />
      </FormControl>
      <FormControl>
        <FormLabel>email</FormLabel>
        <Input value={formattedEmail()} readOnly />
      </FormControl>
      <FormControl>
        <FormLabel>age</FormLabel>
        <Input type="text" value={member.age} readOnly />
      </FormControl>
      <FormControl>
        <FormLabel>gender</FormLabel>
        <Input type="text" value={member.gender} readOnly />
      </FormControl>
      <Button
        colorScheme="purple"
        onClick={() => navigate("/medit/" + member.id)}
      >
        수정
      </Button>
      <Button colorScheme="red" onClick={onOpen}>
        탈퇴
      </Button>
      {orderNameControls}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>탈퇴 확인</ModalHeader>
          <ModalCloseButton />
          <ModalBody>탈퇴 하시겠습니까?</ModalBody>

          <ModalFooter>
            <Button onClick={onClose}>닫기</Button>
            <Button onClick={handleDelete} colorScheme="red">
              탈퇴
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
