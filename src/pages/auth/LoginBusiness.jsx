import LoginForm from './LoginForm'

export default function LoginBusiness() {
  return (
    <LoginForm
      role="business"
      title="브랜드로 로그인"
      subtitle="CNEC Connect에 등록된 브랜드·기업 계정으로 로그인합니다."
      signupTo="/signup/business"
      accentClass="bg-gradient-to-br from-[#1A0F5C] via-[#2A1E7A] to-[#5B47FB]"
    />
  )
}
