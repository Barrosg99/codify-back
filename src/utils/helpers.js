const getEmailMessage = (user, token) => `
    <h1 style="font-family: 'Roboto';">Codify</h1>
    <h2>Olá, ${user.name}!</h2>
    Para redefinir sua senha para acesso ao portal de cursos, use o botão abaixo. Este botão é válido por 5 minutos, então caso o tempo seja excedido faça uma nova solicitação de redefinição de senha.
    
    <br><br>
    <div style="width: 100%; display: flex; justify-content: center; align-items: center;">
      <a href=${process.env.PWD_RESET_URL}/${token} style="margin: 0 auto;">
        <button style="background: #46A7D4; width: 150px; height: 40px; font-size: 16px; cursor: pointer; color: white; border-radius: 10px; border: none;">Redefinir senha</button>
      </a>
    </div>

    <br><br>Caso você não tenha solicitado uma redefinição de senha, ignore este e-mail.
    
    <br><br>Equipe Codify
  `;

module.exports = { getEmailMessage };
