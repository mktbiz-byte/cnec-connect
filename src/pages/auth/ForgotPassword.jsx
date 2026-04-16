import { Link } from 'react-router-dom'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'

export default function ForgotPassword() {
  return (
    <Container className="py-20 text-center">
      <h1 className="display-2">비밀번호를 잊으셨나요?</h1>
      <p className="mt-4 text-[15px] text-[#6B7280]">
        비밀번호 재설정 기능은 곧 제공됩니다. 데모 기간에는 <b>hello@cnec.co</b>로 이메일을 보내주세요.
      </p>
      <div className="mt-8 flex justify-center">
        <Button as={Link} to="/login" variant="outline">로그인으로 돌아가기</Button>
      </div>
    </Container>
  )
}
