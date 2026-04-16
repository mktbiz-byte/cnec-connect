import LoginForm from './LoginForm'

export default function LoginCreator() {
  return (
    <LoginForm
      role="creator"
      title="크리에이터로 로그인"
      subtitle="CNEC Connect에 등록된 크리에이터 계정으로 로그인합니다."
      signupTo="/signup/creator"
      accentClass="bg-[#0B0B1A]"
    />
  )
}
