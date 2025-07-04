import { LoadingButton } from "@mui/lab";
import { Alert, Box, Button, Stack, TextField, Typography, InputAdornment, IconButton } from "@mui/material";
import { useFormik } from "formik";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import * as Yup from "yup";
import userApi from "../../api/modules/user.api";
import { setAuthModalOpen } from "../../redux/features/authModalSlice";
import { setUser } from "../../redux/features/userSlice";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const SignupForm = ({ switchAuthState }) => {
  const dispatch = useDispatch();

  const [isLoginRequest, setIsLoginRequest] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const signinForm = useFormik({
    initialValues: {
      password: "",
      username: "",
      displayName: "",
      confirmPassword: ""
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(8, "Tên đăng nhập tối thiểu 8 ký tự")
        .required("Vui lòng nhập tên đăng nhập"),
      password: Yup.string()
        .min(8, "Mật khẩu tối thiểu 8 ký tự")
        .required("Vui lòng nhập mật khẩu"),
      displayName: Yup.string()
        .min(8, "Tên hiển thị tối thiểu 8 ký tự")
        .required("Vui lòng nhập tên hiển thị"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Mật khẩu nhập lại không khớp")
        .min(8, "Mật khẩu nhập lại tối thiểu 8 ký tự")
        .required("Vui lòng nhập lại mật khẩu")
    }),
    onSubmit: async values => {
      setErrorMessage(undefined);
      setIsLoginRequest(true);
      const { response, err } = await userApi.signup(values);
      setIsLoginRequest(false);

      if (response) {
        signinForm.resetForm();
        dispatch(setUser(response));
        dispatch(setAuthModalOpen(false));
        toast.success("Đăng ký thành công");
      }

      if (err) setErrorMessage(err.message);
    }
  });

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Box component="form" onSubmit={signinForm.handleSubmit}>
      <Typography variant="h5" fontWeight={600} textAlign="center" mb={4}>
        Đăng ký tài khoản
      </Typography>
      
      <Stack spacing={3}>
        <TextField
          type="text"
          label="Tên đăng nhập"
          name="username"
          fullWidth
          value={signinForm.values.username}
          onChange={signinForm.handleChange}
          color="primary"
          variant="outlined"
          error={signinForm.touched.username && signinForm.errors.username !== undefined}
          helperText={signinForm.touched.username && signinForm.errors.username}
          InputProps={{
            sx: { borderRadius: 1, bgcolor: 'background.paper' }
          }}
        />
        <TextField
          type="text"
          label="Tên hiển thị"
          name="displayName"
          fullWidth
          value={signinForm.values.displayName}
          onChange={signinForm.handleChange}
          color="primary"
          variant="outlined"
          error={signinForm.touched.displayName && signinForm.errors.displayName !== undefined}
          helperText={signinForm.touched.displayName && signinForm.errors.displayName}
          InputProps={{
            sx: { borderRadius: 1, bgcolor: 'background.paper' }
          }}
        />
        <TextField
          type={showPassword ? "text" : "password"}
          label="Mật khẩu"
          name="password"
          fullWidth
          value={signinForm.values.password}
          onChange={signinForm.handleChange}
          color="primary"
          variant="outlined"
          error={signinForm.touched.password && signinForm.errors.password !== undefined}
          helperText={signinForm.touched.password && signinForm.errors.password}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={toggleShowPassword} edge="end">
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
            sx: { borderRadius: 1, bgcolor: 'background.paper' }
          }}
        />
        <TextField
          type={showConfirmPassword ? "text" : "password"}
          label="Nhập lại mật khẩu"
          name="confirmPassword"
          fullWidth
          value={signinForm.values.confirmPassword}
          onChange={signinForm.handleChange}
          color="primary"
          variant="outlined"
          error={signinForm.touched.confirmPassword && signinForm.errors.confirmPassword !== undefined}
          helperText={signinForm.touched.confirmPassword && signinForm.errors.confirmPassword}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={toggleShowConfirmPassword} edge="end">
                  {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
            sx: { borderRadius: 1, bgcolor: 'background.paper' }
          }}
        />
      </Stack>

      <LoadingButton
        type="submit"
        fullWidth
        size="large"
        variant="contained"
        sx={{ 
          marginTop: 4,
          py: 1.2,
          borderRadius: 1,
          fontWeight: 500,
          fontSize: '0.9rem'
        }}
        loading={isLoginRequest}
      >
        Đăng ký
      </LoadingButton>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
          Đã có tài khoản?
        </Typography>
        <Button
          fullWidth
          variant="outlined"
          sx={{ borderRadius: 1 }}
          onClick={() => switchAuthState()}
        >
          Đăng nhập
        </Button>
      </Box>

      {errorMessage && (
        <Box sx={{ marginTop: 2 }}>
          <Alert severity="error" variant="outlined" >{errorMessage}</Alert>
        </Box>
      )}
    </Box>
  );
};

export default SignupForm;