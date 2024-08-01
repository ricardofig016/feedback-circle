export async function securityPortalAuth(username, password) {
  const url = "https://vm-onefab.cmf.criticalmanufacturing.com:9089";
  const formData = new URLSearchParams();
  formData.set("grant_type", "password");
  formData.set("username", username);
  formData.set("password", password);
  formData.set(
    "input",
    JSON.stringify({
      $type: "Cmf.Foundation.BusinessOrchestration.SecurityManagement.InputObjects.LoginUserInput, Cmf.Foundation.BusinessOrchestration",
      Username: username,
      Password: password,
      Domain: "CMF",
    })
  );

  const res = await fetch(`${url}/api/token`, {
    method: "POST",
    body: formData,
    headers: {
      Cmf_SessionId: (Math.random() * (1000000000000 - 1) + 1).toString(),
    },
  });

  if (!res.ok) {
    console.log("Wrong email or password");
    return {};
  }

  const json = await res.json();
  const { access_token } = json;

  return access_token;
}
