import LoginForm from './LoginForm'

export default function LoginCreator() {
  return (
    <LoginForm
      role="creator"
      title="크리에이터로 로그인"
      subtitle="CNEC Connect에 등록된 크리에이터 계정으로 로그인합니다."
      signupTo="/signup/creator"
      accentClass="bg-gradient-to-br from-[#003F3A] via-[#007469] to-[#00C2A8]"
    />
  )
}
