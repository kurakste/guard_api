  Функционал бекэнда в разрезе клиентов (mob_app, Control Panel)
  
  Mob App:
  - Сохранить форму регистрации пользователя.  
    POST: _api_/user-new-ap
    Content-type: multipart/form-data
    params: 
      firstName: string,
      lastName: string,
      email: string,
      tel: string,
      password: string,
      img: file,
      pasImg1: file,
      pasImg2: file,
    returns: json:
      firstName: string,
      lastName: string,
      email:string,
      tel:string,
      img: file,
      pasImg1: file,
      pasImg2: file, 

  - Авторизовать пользователя
    POST: _api_/user-app-sign-in
    Content-type: multipart/form-data
    params: 
      email: string,
      password: string,
    returns: json:
      {
        user: user,
        auth-token: string,
      }

  - Получить статус регистрации
    // может редирект на логин и там работает логика 

  - Получить текущий баланс:
    GET: _api_/user-get-balance/:id
    { ballance: number }

  - Получить историю оплат:
    GET: _api_/user-get-bills/:id 
    {
      id: number
      date: date,
      type: 'recharge'|'disposal',
      sum: number,
    }

  // TODO:  Нужно обдумать проблему точного времени. Кто гарант точного времени. 
  // Это касается фиксации событий (трек, тревога, )
  // В какой временной зоне все это находится? Кто главный? Если сервер
  // то как это переводить во время для каждого пользователя. 

  - Получить историю тревог 
    GET: _api_/user-get-alarm-history/
    // Авторизированного пользователя и его права мы знаем из токена:
    {
      [
        {
          id: number,
          timeStamp: number, 
          lon: number,
          lat: number,
          track: {
            id: number,
            start: timestamp,
            stop: timestamp,
            points: [
              { id: number, trackId: number, lon: number, lat: number, time: timestamp }
              ...
            ]
          }
          operatorId: number;
          pickedUp: timestamp, // Оператор взял в обработку
          fakeAlert: boolean, // Оператор признал вызов ошибочным, деньги не списывались группа не ездила. 
          approved: timestamp, .. Оператор проверил и выставил fakeAllert false,
          sentTeam: timestamp, // Выслана группа 
          workDone: timestamp, // Группа отработала, тревога закрыта.
        }, 
      ]

    }
  -----
  - Создать новую тревогу: 
    SOCK: ??? 
    отправить объект: 
      {
        uid: number,
        lat: number,
        lon: number,
      } во ответ получить  idAlert тревоги
      начать писать трек. Обновлять его на сервере: 
      [ { idAlert, lon, lat }, ]

  -----

  // TODO: решить что здесь. Пока совсем не понятно.
  - Привязать дочернее устройство
  - Получить маршруты дочернего устройства
  - Сохранить маршрут дочернего устройства
  - Отправить хук - дочернее приложение закрыто ( сокет? ) /рвется связь..../ 
  - Отправить хук дочернее приложение открыто ( сокет? )
  
   Control Panel:
    - Регистрировать кандидата 
      POST: _api_/user-new-cp
      Content-type: multipart/form-data
      params: 
        firstName: string,
        lastName: string,
        email: string,
        tel: string,
        password: string,
      returns: json:
        firstName: string,
        lastName: string,
        email:string,
        tel:string,
        img: file,
        pasImg1: file,
        pasImg2: file, 
      //
    - Отдать всех кандидатов в пользователи (не подтвержденных)
    - Подтверждение нового пользователя приложения,
    - Отклонить пользователя приложения
    - Отдать текущие тревоги (объекты тревога, пользователь, трек, ЧОПы);
    - Отдать отдать текущий трек по текущей тревоги // что делать если человек пересек границу субъекта после начала тревоги?)
    - закрепить тревогу за оператором
    - Изменить статус тревоги
    - Получить субъект федерации по координатам
    - Получить массив ЧОПов по координатам
    =====



