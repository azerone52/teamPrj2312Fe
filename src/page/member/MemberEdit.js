import { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
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
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Spinner,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import axios from "axios";

export function MemberEdit() {
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const toast = useToast();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [age, setAge] = useState(0);
  const [gender, setGender] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [initialData, setInitialData] = useState(null);

  // 수정 여부 체크하는 hook
  const [isNameEdited, setIsNameEdited] = useState(false);
  const [isPasswordEdited, setIsPasswordEdited] = useState(false);
  const [isAddressEdited, setIsAddressEdited] = useState(false);
  const [isAgeEdited, setIsAgeEdited] = useState(false);
  const [isGenderEdited, setIsGenderEdited] = useState(false);

  // 멤버 불러오기
  useEffect(() => {
    getMember();
  }, []);

  function getMember() {
    const accessToken = localStorage.getItem("accessToken");
    console.log("엑세스 토큰", accessToken);
    axios
      .get("/member", { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((response) => {
        console.log("getMember()의 then 실행");
        setMember(response.data);
        console.log("멤버 함수 결과 : " + response.data.id);
        setName(response.data.name);
        setAddress(response.data.address);
        setGender(response.data.gender);
        setAge(response.data.age);
      })
      .catch((error) => {
        if (error.response.status === 401) {
          console.log("getMember()의 catch 실행");
          localStorage.removeItem("accessToken");
          sendRefreshToken();
          console.log("sendRefreshToken 호출");
        } else if (error.response.status === 403) {
          console.log("403에러");
        } else {
          console.log("그 외 에러");
        }
      });
  }

  // 기존 데이터 저장
  useEffect(() => {
    if (member !== null) {
      setInitialData({
        name: member.name,
        password: member.password,
        address: member.address,
        age: member.age,
        gender: member.gender,
      });
    }
  }, [member]);

  // 기존 데이터에서 변경이 있을 경우 기록
  const handleNameChange = (e) => {
    setName(e.target.value);
    setIsNameEdited(true);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setIsPasswordEdited(true);
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
    setIsAddressEdited(true);
  };

  const handleAgeChange = (value) => {
    setAge(value);
    setIsAgeEdited(true);
  };

  const handleGenderChange = (e) => {
    setGender(e.target.value);
    setIsGenderEdited(true);
  };

  // 토큰 리프레쉬
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
        toast({
          description: "권한이 없습니다",
          status: "warning",
        });
        //navigate("/login");
      });
  }

  // 해당 멤버 존재하지 않을 경우 Spinner
  if (member === null) {
    return <Spinner />;
  }

  // 패스워드 규칙에 맞는지 체크
  let passwordChecked = false;
  if (passwordCheck === password) {
    passwordChecked = true;
  }
  if (password.length === 0) {
    passwordChecked = true;
  }

  // 버튼 비활성화 지정
  // 수정 시 필수로 필요한 데이터 -> 패스워드
  // 나머지는 수정 안해도 괜찮도록 함
  const isButtonDisabled = () => {
    return !(
      isPasswordEdited &&
      password !== initialData.password &&
      passwordChecked
    );
  };

  // 백엔드로 전송
  const handleEdit = () => {
    // 데이터가 수정됐을 경우만 반영하도록 state hook 사용
    if (isNameEdited) {
      initialData.name = name;
    }

    if (isPasswordEdited) {
      initialData.password = password;
    }

    if (isAddressEdited) {
      initialData.address = address;
    }

    if (isAgeEdited) {
      initialData.age = age;
    }

    if (isGenderEdited) {
      initialData.gender = gender;
    }

    axios
      .put(
        "/member/edit/" + member.id,
        {
          id: member.id,
          logId: member.logId,
          ...initialData,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      )
      .then(() => {
        toast({
          description: member.id + "번 회원이 수정 됐습니다.",
          status: "success",
        });
        navigate(-1);
      })
      .catch((error) => {
        if (error.response.status === 401 || error.response.status === 403) {
          toast({
            description: "요청이 잘못됐습니다",
            status: "error",
          });
        } else {
          toast({
            description: "수정 중에 문제가 발생했습니다",
            status: "error",
          });
        }
      })
      .finally(() => onClose());
  };

  return (
    <Box>
      <Heading>{member.name}님 정보</Heading>
      <FormControl isRequired>
        <FormHelperText size="sm">
          수정하지 않을 시 기존 정보가 보존됩니다
        </FormHelperText>
        <FormLabel>password</FormLabel>
        <Input
          type="password"
          value={member.password}
          onChange={handlePasswordChange}
        />
      </FormControl>
      {password.length > 0 && (
        <FormControl isInvalid={!passwordChecked}>
          <FormLabel>password 확인</FormLabel>
          <Input
            type="password"
            value={passwordCheck}
            onChange={(e) => setPasswordCheck(e.target.value)}
          />
          <FormErrorMessage>패스워드가 일치하지 않습니다</FormErrorMessage>
        </FormControl>
      )}

      <FormControl>
        <FormLabel>Name</FormLabel>
        <Input type="text" value={name} onChange={handleNameChange} />
      </FormControl>
      <FormControl>
        <FormLabel>Address</FormLabel>
        <Input type="text" value={address} onChange={handleAddressChange} />
      </FormControl>
      <FormControl>
        <FormLabel>Age</FormLabel>
        <NumberInput
          defaultValue={age !== null ? age : 0}
          min={15}
          max={99}
          onChange={handleAgeChange}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>
      <FormControl>
        <FormLabel>Gender</FormLabel>
        <Select
          placeholder={gender !== null ? gender : "male"}
          onChange={handleGenderChange}
        >
          <option value="male">male</option>
          <option value="female">female</option>
        </Select>
      </FormControl>

      <Button
        colorScheme="purple"
        isDisabled={isButtonDisabled()}
        onClick={onOpen}
      >
        수정
      </Button>
      <Button onClick={() => navigate(-1)}>취소</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>수정 확인</ModalHeader>
          <ModalCloseButton />
          <ModalBody>수정 하시겠습니까?</ModalBody>

          <ModalFooter>
            <Button onClick={onClose}>닫기</Button>
            <Button onClick={handleEdit} colorScheme="red">
              수정
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
