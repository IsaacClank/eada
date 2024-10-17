import React from "react";
import { useNavigate } from "react-router-dom";

export default function RegistrationPage() {
  const navigate = useNavigate();

  const submitRegistrationForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const formJson = Object.fromEntries(formData.entries());

    fetch("http://localhost:3000/account", {
      method: "PUT",
      body: JSON.stringify(formJson),
      headers: [["Content-Type", "application/json"]],
    }).then(() => {
      navigate("/login");
    });
  };

  return (
    <div className="flex justify-center mt-8">
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => submitRegistrationForm(e)}
      >
        <div className="flex flex-col gap-2">
          <div>
            <label htmlFor="email">Email</label>
            <div>
              <input type="email" name="email" className="bg-slate-200" />
            </div>
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <div>
              <input type="password" name="password" className="bg-slate-200" />
            </div>
          </div>
        </div>

        <input type="submit" className="bg-blue-300" />
      </form>
    </div>
  );
}
