import Navigation from '../components/Navigation';

export default function Register() {
  return (
    <div className="form">
      <Navigation />
      <h2 className="form-register">Создание аккаунта</h2>
      <p>Это сайт с рецептами для всей семьи</p>
      <form id="registerForm">
        <label htmlFor="username">Логин</label><br />
        <input type="text" id="username" name="username" required /><br />
        
        <label htmlFor="password">Пароль</label><br />
        <input type="password" id="password" name="password" required /><br />
        
        <label htmlFor="confirm_password">Подтвердите пароль</label><br />
        <input type="password" id="confirm_password" name="confirm_password" required /><br />
        
        <input type="submit" id="sign-in" className="btn" value="Зарегистрироваться" />
      </form>
      <p><a href="login">Есть аккаунт?</a></p>
    </div>
  )
}