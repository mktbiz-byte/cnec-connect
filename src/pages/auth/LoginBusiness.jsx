import LoginForm from './LoginForm'

export default function LoginBusiness() {
  return (
    <LoginForm
      role="business"
      title="브랜드로 로그인"
      subtitle="CNEC Connect에 등록된 브랜드·기업 계정으로 로그인합니다."
      signupTo="/signup/business"
      accentClass="bg-[#5B47FB]"
    />
  )
}
