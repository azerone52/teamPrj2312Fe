import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Image,
  Input,
  Spinner,
  Stack,
  Switch,
  Text,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useImmer } from "use-immer";
import axios from "axios";

export function BoardEdit() {
  const [board, updateBoard] = useImmer(null); //객체 사용해서 가변적으로 상태 변경
  // /edit/:id
  const { id } = useParams();
  const [fileURL, setFileURL] = useState("");
  // const [previousFileUrl, setPreviousFileUrl] = useState('');
  // const handleFileUrl = () => {
  //   setPreviousFileUrl(fileURL);
  // };
  //먼저 조회함.  updateBoard로 응답 받아옴
  const navigate = useNavigate();
  const toast = useToast();
  const [boardFiles, setBoardFiles] = useState(null);
  const [removeFileIds, setRemoveFileIds] = useState([]);

  //

  useEffect(() => {
    axios
      .get("/api/board/id/" + id)
      .then((response) => updateBoard(response.data));
  }, []);
  // useEffect(() => {
  //   axios.get("/api/board/edit/"+ id)
  //     .then((response)=>setFileURL(response.data))
  //     .catch((error)=> console.log(error))
  //     .finally(()=>console.log("얍"));
  // }, []);

  // useEffect(() => {
  //   if (board !== null) {
  //     setPreviousFileUrl(fileURL); // 이전 이미지 URL 설정
  //   }
  // }, [board]);

  if (board === null) {
    return <Spinner />;
  }

  function handleFileUrlChange(e) {
    setFileURL(e.target.value);
  }

  //타이틀 수정
  function handleTitleEdit(e) {
    updateBoard((draft) => {
      draft.title = e.target.value;
    });
  }

  //가수 명 수정
  function handleArtistEdit(e) {
    updateBoard((draft) => {
      draft.artist = e.target.value;
    });
  }

  //발매일자 수정
  function handleReleaseDateEdit(e) {
    updateBoard((draft) => {
      draft.releaseDate = e.target.value;
    });
  }

  //가격 수정
  function handlePriceEdit(e) {
    updateBoard((draft) => {
      draft.price = e.target.value;
    });
  }

  function handleContentEdit(e) {
    updateBoard((draft) => {
      draft.content = e.target.value;
    });
  }
  function handleQuantityEdit(e) {
    updateBoard((draft) => {
      draft.stockQuantity = e.target.value;
    });
  }

  // 이미지 수정 코드
  // function handleImageUpload(e){}
  //   const file = e.target.images[0]; //
  //   const formData= new FormData();
  //   formData.append("file",file);
  //
  //   axios
  //     .post("/api/upload",formData)
  //     .then((response)=> {
  //       updateBoard((draft)=> {
  //         draft.imageURL = response.data.url; //이미지 url
  //       });
  //     });
  //
  // }

  function handleSubmit(e) {
    const accessToken = localStorage.getItem("accessToken");

    axios
      .putForm(
        "/api/board/edit/" + id,
        {
          title: board.title,
          artist: board.artist,
          price: board.price,
          content: board.content,
          fileURL: board.fileURL,
          releaseDate: board.releaseDate,
          stockQuantity: board.stockQuantity,
          removeFileIds, //삭제할 이미지도 전송
          uploadFiles: boardFiles,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )
      .then((response) => {
        toast({
          description: id + "번 앨범이 수정되었습니다.",
          status: "success",
        });
        console.log(removeFileIds);
      })
      .catch((error) =>
        toast({
          description: "수정 중 문제가 발생하였습니다.",
          status: "error",
        }),
      );
  }

  function handleRemoveFileSwitch(e) {
    if (e.target.checked) {
      setRemoveFileIds([...removeFileIds, e.target.value]);
      updateBoard((draft) => {
        draft.boardFiles = draft.boardFiles.filter(
          (file) => file.id !== e.target.value,
        );
      });
    } else {
      setRemoveFileIds(removeFileIds.filter((item) => item !== e.target.value));
    }
  }

  //--------------------------------------등록된 상품 수정 폼
  return (
    <Container>
      <Heading>No.{id} Edit </Heading>
      <br />
      <FormControl>
        <FormLabel>Image</FormLabel>
        {/*처음 등록 했던 상품의 이미지 : 건들이지 않기.....젭알 */}
        {board.boardFiles !== null &&
          board.boardFiles.map((file) => (
            <Box key={file.id}>
              <Image src={file.fileUrl} alt={file.fileName} w="100%" />
              <Text>
                등록되어 있는 이미지를 삭제하고 다시 등록 하시겠습니까?
              </Text>
              <Switch
                value={file.id}
                colorScheme="pink"
                onChange={handleRemoveFileSwitch}
              />
            </Box>
          ))}
      </FormControl>
      {/*앨범 타이틀. 가수명, 가격, 발매일자 ,발매 회사 순*/}

      {/*타이틀 수정 폼*/}
      <FormControl>
        <FormLabel>Album Title</FormLabel>
        <Input value={board.title} onChange={handleTitleEdit} />
      </FormControl>
      {/*가수명 편집 */}
      <FormControl>
        <FormLabel>Artist Name Edit</FormLabel>
        <Input value={board.artist} onChange={handleArtistEdit} />
      </FormControl>
      {/*발매일자 편집 */}
      <FormControl>
        <FormLabel>ReleseDate Edit</FormLabel>
        <Input
          type="date"
          value={board.releaseDate}
          onChange={handleReleaseDateEdit}
        />
      </FormControl>
      {/*수량 수정 */}
      <FormControl>
        <FormLabel>stockQuantity Edit</FormLabel>
        <Input value={board.stockQuantity} onChange={handleQuantityEdit} />
      </FormControl>
      {/*가격 수정 */}
      <FormControl>
        <FormLabel>Album Price Edit</FormLabel>
        <Input value={board.price} onChange={handlePriceEdit} />
      </FormControl>
      {/*앨범 상세 설명 란*/}
      <FormControl>
        <FormLabel>앨범 상품 상세 설명 수정</FormLabel>
        <Input value={board.content} onChange={handleContentEdit} />
      </FormControl>

      {/*----------------이미지 파일 수정 코드 --------------*/}
      {removeFileIds.length > 0 && (
        <FormControl>
          <FormLabel>Album Image Update</FormLabel>
          {/*<Text>Previous Image URL: {board.fileName}</Text>*/}
          <Image src={fileURL} borderRadius="l" border="0px solid black" />
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setBoardFiles(e.target.files[0])}
          />
          {/*<FormHelperText color="red.200">*/}
          {/*  한 개 파일은 1MB 이내, 총 용량은 10MB 이내로 첨부 가능합니다.*/}
          {/*</FormHelperText>*/}
          {/*|이미지 편집 이벤트가 없음,.*/}
        </FormControl>
      )}

      <Stack>
        <Button onClick={() => navigate(-1)} colorScheme="red">
          취소
        </Button>
        <Button onClick={handleSubmit} colorScheme="orange">
          수정
        </Button>
      </Stack>
    </Container>
  );
}
