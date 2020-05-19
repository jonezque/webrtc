import React from "react";
import "./App.css";
import { Switch, Route, NavLink, useRouteMatch, useHistory } from "react-router-dom";
import { Offline } from "./Offline";
import { Channel } from "./Channel";
import { API_URL } from "./environment";

function App() {
  const match = useRouteMatch("/");
  const navigate = useHistory();

  return (
    <>
      <div className={"center"} style={{ flexDirection: "column" }}>
        <h2>WebRTC</h2>
        {match?.isExact ? (
          <ul>
            <li>
              <NavLink to="/offline">Оффлайн</NavLink>
            </li>
            <li>
              <button
                style={{
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: 16,
                  color: 'rgb(85, 26, 139)',
                  textDecorationLine: 'underline',
                }}
                onClick={async () => {
                  const r = await fetch(API_URL +'channel', { method: 'POST' });
                  const id = await r.text();
                  navigate.push(`/channel_${id}`);
                }}
              >
                Создать групповой звонок
              </button>
            </li>
          </ul>
        ) : (
          <NavLink to="/" style={{ marginTop: "1rem" }}>
            Назад
          </NavLink>
        )}

        <div className={"center"} style={{ marginTop: "1rem" }}>
          <Switch>
            <Route path="/offline" children={<Offline />} />
            <Route path="/channel_:id" children={<Channel />} />
          </Switch>
        </div>
      </div>
    </>
  );
}

export default App;
