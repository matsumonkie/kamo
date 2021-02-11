// acc works strangely with reduce

type User = { id: number }

const findHigherIdIfAbove5 = (users: User[]): number | undefined => users.reduce((acc, user) => {
  if (user.id > 5 && acc && user.id > acc) {
    return user.id;
  }
  return acc;
}, undefined as number); // why ?

const higherId = findHigherIdIfAbove5([{ id: 3 }, { id: 8 }, { id: 9 }]);

// type casting for array

interface Car {
  type: 'car';
  speed: number;
}

interface Bike {
  type: 'bike';
  price: number;
}

interface Bus {
  type: 'bus';
  capacity: number;
}

type Vehicle =
  | Car
  | Bike
  | Bus

/*
const filterOnlyBus = (vehicles: Vehicle[]): Bus[] => {
  return vehicles.filter((vehicle) => {
    switch (vehicle.type) {
      case "bus":
        return true;
      default:
        return false;
    }
  })
}  */ // this doesn't type check,

const isBus = (vehicle: Vehicle): vehicle is Bus => vehicle.type == 'bus';

const filterOnlyBus = (vehicles: Vehicle[]): Bus[] => vehicles.filter((vehicle) => {
  // if (isBus(vehicle)) {
  return isBus(vehicle);
  if (isBus(vehicle)) {
    return true;
  }
  return false;
}) as Bus[];


// return incomplete type


type Letter =
  | B
  | A

interface B {
  type: "b"
}

interface A {
  type: "a"
  id: number
}
const json: any = {};
const letter: Letter = { type: "a", ...json }

// return the correct type

interface Bar {
  type: "bar"
}
const isBar = (foo: Foo): foo is Bar => foo.type === 'bar';

interface Baz {
  type: "baz"
}

type Foo =
  | Bar
  | Baz

const foos: Foo[] = []
/**const bar: Bar = foos.find((foo) => foo.type == "bar") // why ???? you need to cast `as Bar`...
const firstBar: Bar = foos.find((foo) => {
  if (isBar(foo)) { return true } else { return false }
}) */