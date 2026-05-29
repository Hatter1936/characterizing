import Navigation from '../components/Navigation';

export default function Login() {
  return (
    <div className="form">
      <Navigation />
      <h2 className="form-auth">Войти в аккаунт</h2>
      <p>Это сайт с рецептами для всей семьи</p>
      <form id="loginForm">
        <label htmlFor="username">Логин</label><br />
        <input type="text" id="username" name="username" required /><br />
        
        <label htmlFor="password">Пароль</label><br />
        <input type="password" id="password" name="password" required /><br />
        
        <input type="submit" id="sign-in" className="btn" value="Войти" />
      </form>
      <p><a href="register.tsx">Нет аккаунта?</a></p>
    </div>
  )
}