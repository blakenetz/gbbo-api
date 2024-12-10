export interface Recipe {
  id: number;
  title: string;
  link: string;
  img: string;
  difficulty: number | null;
  is_technical: boolean;
  time: number | null;
  baker: Baker | null;
  diet: Diet[];
}

export interface Baker {
  id: number;
  name: string;
  img: string;
}

export interface Diet {
  id: number;
  name: string;
}
