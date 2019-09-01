{
  id: number,
  uid: number, // user id
  created_at: timeStump, 
  state: number, // curent allert state
  track: string, //json string : [{ lat: number, lon: number }, ...];
  oid: number, // operator's id
  picketUp: timeStump, // pickup time
  grbSent: timeStump,
  notes: string, // 
}