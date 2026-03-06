import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, Plus, ShoppingCart, BookOpen,
  Edit2, Trash2, Eye, EyeOff,
  Download, Zap, TrendingUp, Sun, Moon,
} from 'lucide-react';
import html2canvas from 'html2canvas';

// ============================================================================
// TIPOS
// ============================================================================

interface User {
  username: string;
  role: 'superadmin' | 'admin' | 'baker' | 'readonly' | 'personal';
}

// Matriz de permisos centralizada
const PERMS = {
  canEditRecipes:    (r: User['role']) => ['superadmin','admin','baker'].includes(r),
  canUseCalculator:  (r: User['role']) => ['superadmin','admin','baker','personal','readonly'].includes(r),
  canViewInventory:  (r: User['role']) => ['superadmin','admin','baker'].includes(r),
  canEditInventory:  (r: User['role']) => ['superadmin','admin'].includes(r),
  canViewCosts:      (r: User['role']) => ['superadmin','admin'].includes(r),
};

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: 'g' | 'kg' | 'ml' | 'L' | 'oz' | 'lb' | 'unid';
}

interface Recipe {
  id: string;
  name: string;
  category: 'Panadería' | 'Pastelería';
  ingredients: Ingredient[];
  temperature: number;
  time: number;
  instructions: string;
  createdBy: string;
  createdAt: string;
}

interface Operation {
  id: string;
  name: string;
  type: 'kg' | 'L' | 'unid';
  presentationWeight: number;
  unitsPurchased: number;
  totalCost: number;
}

interface State {
  user: User | null;
  recipes: Recipe[];
  operations: Operation[];
  rememberMe: boolean;
  
  setUser: (user: User | null) => void;
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (id: string, recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  addOperation: (op: Operation) => void;
  updateOperation: (id: string, op: Operation) => void;
  deleteOperation: (id: string) => void;
  setRememberMe: (value: boolean) => void;
}

// ============================================================================
// ZUSTAND STORE SIMPLIFICADO
// ============================================================================

const useStore = (() => {
  let state: State;
  const listeners = new Set<() => void>();

  const defaultRecipes: Recipe[] = [
    {
      id: '1',
      name: 'Pan Francés Tradicional',
      category: 'Panadería',
      ingredients: [
        { id: '1', name: 'Harina de trigo', quantity: 500, unit: 'g' },
        { id: '2', name: 'Agua', quantity: 300, unit: 'ml' },
        { id: '3', name: 'Sal', quantity: 10, unit: 'g' },
        { id: '4', name: 'Levadura fresca', quantity: 10, unit: 'g' },
      ],
      temperature: 220,
      time: 45,
      instructions: 'Mezclar ingredientes, fermentar 2 horas, formar y hornear. Clásico de la panadería francesa.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Pan Integral Saludable',
      category: 'Panadería',
      ingredients: [
        { id: '1', name: 'Harina integral', quantity: 400, unit: 'g' },
        { id: '2', name: 'Harina de trigo', quantity: 100, unit: 'g' },
        { id: '3', name: 'Agua tibia', quantity: 320, unit: 'ml' },
        { id: '4', name: 'Sal', quantity: 8, unit: 'g' },
        { id: '5', name: 'Levadura', quantity: 7, unit: 'g' },
        { id: '6', name: 'Miel', quantity: 20, unit: 'ml' },
      ],
      temperature: 200,
      time: 50,
      instructions: 'Mezclar harinas y agua, dejar reposar 30 min, agregar levadura, fermentar lentamente y hornear.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Croissant Francés Premium',
      category: 'Panadería',
      ingredients: [
        { id: '1', name: 'Harina', quantity: 500, unit: 'g' },
        { id: '2', name: 'Mantequilla', quantity: 250, unit: 'g' },
        { id: '3', name: 'Leche', quantity: 250, unit: 'ml' },
        { id: '4', name: 'Azúcar', quantity: 50, unit: 'g' },
        { id: '5', name: 'Sal', quantity: 10, unit: 'g' },
        { id: '6', name: 'Levadura', quantity: 10, unit: 'g' },
      ],
      temperature: 200,
      time: 30,
      instructions: 'Preparar masa madre, laminación con mantequilla, doblados, corte en triángulos, fermentar y hornear.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Torta de Chocolate Jugosa',
      category: 'Pastelería',
      ingredients: [
        { id: '1', name: 'Harina', quantity: 300, unit: 'g' },
        { id: '2', name: 'Cacao en polvo', quantity: 60, unit: 'g' },
        { id: '3', name: 'Azúcar', quantity: 350, unit: 'g' },
        { id: '4', name: 'Huevos', quantity: 4, unit: 'unid' },
        { id: '5', name: 'Mantequilla', quantity: 150, unit: 'g' },
        { id: '6', name: 'Leche', quantity: 200, unit: 'ml' },
        { id: '7', name: 'Polvo de hornear', quantity: 12, unit: 'g' },
      ],
      temperature: 180,
      time: 35,
      instructions: 'Cremar mantequilla y azúcar, agregar huevos, mezclar secos, hornear hasta que pase el palillo.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '5',
      name: 'Cheesecake New York',
      category: 'Pastelería',
      ingredients: [
        { id: '1', name: 'Galletas digestivas', quantity: 200, unit: 'g' },
        { id: '2', name: 'Mantequilla derretida', quantity: 100, unit: 'g' },
        { id: '3', name: 'Queso crema', quantity: 600, unit: 'g' },
        { id: '4', name: 'Azúcar', quantity: 150, unit: 'g' },
        { id: '5', name: 'Huevos', quantity: 3, unit: 'unid' },
        { id: '6', name: 'Crema ácida', quantity: 200, unit: 'ml' },
        { id: '7', name: 'Vainilla', quantity: 10, unit: 'ml' },
      ],
      temperature: 170,
      time: 60,
      instructions: 'Base de galletas, mezclar queso crema con azúcar, agregar huevos lentamente, hornear a baño maría.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '6',
      name: 'Pan de Canela y Azúcar',
      category: 'Panadería',
      ingredients: [
        { id: '1', name: 'Harina', quantity: 400, unit: 'g' },
        { id: '2', name: 'Leche tibia', quantity: 200, unit: 'ml' },
        { id: '3', name: 'Huevos', quantity: 2, unit: 'unid' },
        { id: '4', name: 'Mantequilla', quantity: 80, unit: 'g' },
        { id: '5', name: 'Azúcar', quantity: 100, unit: 'g' },
        { id: '6', name: 'Canela molida', quantity: 15, unit: 'g' },
        { id: '7', name: 'Levadura', quantity: 10, unit: 'g' },
      ],
      temperature: 190,
      time: 40,
      instructions: 'Masa dulce, enrollar con mezcla de canela y azúcar, fermentar, hornear hasta dorados.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '7',
      name: 'Donas Glaseadas Clásicas',
      category: 'Panadería',
      ingredients: [
        { id: '1', name: 'Harina', quantity: 300, unit: 'g' },
        { id: '2', name: 'Azúcar', quantity: 80, unit: 'g' },
        { id: '3', name: 'Huevos', quantity: 2, unit: 'unid' },
        { id: '4', name: 'Leche', quantity: 150, unit: 'ml' },
        { id: '5', name: 'Levadura en polvo', quantity: 10, unit: 'g' },
        { id: '6', name: 'Aceite', quantity: 60, unit: 'ml' },
        { id: '7', name: 'Vainilla', quantity: 5, unit: 'ml' },
      ],
      temperature: 180,
      time: 25,
      instructions: 'Mezclar ingredientes secos, agregar húmedos, freír en aceite caliente, glasear.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '8',
      name: 'Brownies de Chocolate Negro',
      category: 'Pastelería',
      ingredients: [
        { id: '1', name: 'Chocolate negro', quantity: 200, unit: 'g' },
        { id: '2', name: 'Mantequilla', quantity: 150, unit: 'g' },
        { id: '3', name: 'Azúcar', quantity: 200, unit: 'g' },
        { id: '4', name: 'Huevos', quantity: 3, unit: 'unid' },
        { id: '5', name: 'Harina', quantity: 100, unit: 'g' },
        { id: '6', name: 'Polvo de hornear', quantity: 5, unit: 'g' },
        { id: '7', name: 'Nueces', quantity: 100, unit: 'g' },
      ],
      temperature: 175,
      time: 30,
      instructions: 'Derretir chocolate y mantequilla, mezclar con azúcar y huevos, agregar harina, hornear.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '9',
      name: 'Tarta de Fresas y Crema',
      category: 'Pastelería',
      ingredients: [
        { id: '1', name: 'Harina', quantity: 250, unit: 'g' },
        { id: '2', name: 'Azúcar', quantity: 100, unit: 'g' },
        { id: '3', name: 'Huevos', quantity: 3, unit: 'unid' },
        { id: '4', name: 'Mantequilla', quantity: 100, unit: 'g' },
        { id: '5', name: 'Crema para batir', quantity: 300, unit: 'ml' },
        { id: '6', name: 'Fresas frescas', quantity: 400, unit: 'g' },
        { id: '7', name: 'Mermelada de fresa', quantity: 100, unit: 'ml' },
      ],
      temperature: 190,
      time: 35,
      instructions: 'Bizcocho base, crema batida con azúcar, colocar fresas, decorar con mermelada.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '10',
      name: 'Pan de Ajo Casero',
      category: 'Panadería',
      ingredients: [
        { id: '1', name: 'Pan francés', quantity: 600, unit: 'g' },
        { id: '2', name: 'Mantequilla', quantity: 150, unit: 'g' },
        { id: '3', name: 'Ajo molido', quantity: 30, unit: 'g' },
        { id: '4', name: 'Perejil fresco', quantity: 20, unit: 'g' },
        { id: '5', name: 'Sal', quantity: 5, unit: 'g' },
        { id: '6', name: 'Pimienta negra', quantity: 3, unit: 'g' },
      ],
      temperature: 200,
      time: 15,
      instructions: 'Mezclar mantequilla con ajo y perejil, untar pan cortado, envolver y hornear.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '11',
      name: 'Empanadas Rellenas de Carne',
      category: 'Panadería',
      ingredients: [
        { id: '1', name: 'Harina', quantity: 500, unit: 'g' },
        { id: '2', name: 'Mantequilla', quantity: 100, unit: 'g' },
        { id: '3', name: 'Agua', quantity: 200, unit: 'ml' },
        { id: '4', name: 'Carne molida', quantity: 400, unit: 'g' },
        { id: '5', name: 'Cebolla', quantity: 150, unit: 'g' },
        { id: '6', name: 'Ajo', quantity: 20, unit: 'g' },
        { id: '7', name: 'Huevo', quantity: 1, unit: 'unid' },
      ],
      temperature: 200,
      time: 25,
      instructions: 'Preparar masa, relleno de carne salteada, cerrar bien, pintar con huevo y hornear hasta dorado.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '12',
      name: 'Tres Leches Premium',
      category: 'Pastelería',
      ingredients: [
        { id: '1', name: 'Harina', quantity: 250, unit: 'g' },
        { id: '2', name: 'Huevos', quantity: 4, unit: 'unid' },
        { id: '3', name: 'Azúcar', quantity: 200, unit: 'g' },
        { id: '4', name: 'Leche condensada', quantity: 400, unit: 'ml' },
        { id: '5', name: 'Leche evaporada', quantity: 400, unit: 'ml' },
        { id: '6', name: 'Crema de leche', quantity: 200, unit: 'ml' },
        { id: '7', name: 'Vainilla', quantity: 10, unit: 'ml' },
      ],
      temperature: 180,
      time: 30,
      instructions: 'Bizcocho esponjoso, mezclar tres leches, verter sobre el bizcocho, refrigerar 4 horas.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '13',
      name: 'Moka de Café',
      category: 'Pastelería',
      ingredients: [
        { id: '1', name: 'Harina', quantity: 300, unit: 'g' },
        { id: '2', name: 'Cacao en polvo', quantity: 50, unit: 'g' },
        { id: '3', name: 'Café molido', quantity: 30, unit: 'g' },
        { id: '4', name: 'Azúcar', quantity: 250, unit: 'g' },
        { id: '5', name: 'Huevos', quantity: 4, unit: 'unid' },
        { id: '6', name: 'Mantequilla', quantity: 150, unit: 'g' },
        { id: '7', name: 'Crema para batir', quantity: 400, unit: 'ml' },
      ],
      temperature: 175,
      time: 35,
      instructions: 'Bizcochos de café y chocolate, relleno y cobertura de crema de café, decorar con polvo de café.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '14',
      name: 'Pan de Molde Blanco',
      category: 'Panadería',
      ingredients: [
        { id: '1', name: 'Harina de fuerza', quantity: 600, unit: 'g' },
        { id: '2', name: 'Agua', quantity: 350, unit: 'ml' },
        { id: '3', name: 'Sal', quantity: 12, unit: 'g' },
        { id: '4', name: 'Levadura fresca', quantity: 12, unit: 'g' },
        { id: '5', name: 'Azúcar', quantity: 20, unit: 'g' },
        { id: '6', name: 'Mantequilla', quantity: 50, unit: 'g' },
      ],
      temperature: 210,
      time: 50,
      instructions: 'Amasar, primera fermentación 2 horas, moldear, segunda fermentación 1 hora, hornear.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '15',
      name: 'Tartaleta de Manzana',
      category: 'Pastelería',
      ingredients: [
        { id: '1', name: 'Harina', quantity: 250, unit: 'g' },
        { id: '2', name: 'Mantequilla', quantity: 120, unit: 'g' },
        { id: '3', name: 'Azúcar', quantity: 80, unit: 'g' },
        { id: '4', name: 'Huevo', quantity: 1, unit: 'unid' },
        { id: '5', name: 'Manzanas verdes', quantity: 500, unit: 'g' },
        { id: '6', name: 'Canela', quantity: 10, unit: 'g' },
        { id: '7', name: 'Mermelada de albaricoque', quantity: 100, unit: 'ml' },
      ],
      temperature: 190,
      time: 40,
      instructions: 'Masa quebrada, relleno de manzanas con canela, cubrir con mermelada, hornear hasta dorado.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '16',
      name: 'Baguette Francesa',
      category: 'Panadería',
      ingredients: [
        { id: '1', name: 'Harina de fuerza', quantity: 500, unit: 'g' },
        { id: '2', name: 'Agua', quantity: 310, unit: 'ml' },
        { id: '3', name: 'Sal', quantity: 10, unit: 'g' },
        { id: '4', name: 'Levadura fresca', quantity: 8, unit: 'g' },
      ],
      temperature: 240,
      time: 40,
      instructions: 'Masa hueca, fermentación larga, cortes característicos, hornear a vapor inicial.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '17',
      name: 'Strudel de Manzana',
      category: 'Pastelería',
      ingredients: [
        { id: '1', name: 'Harina', quantity: 300, unit: 'g' },
        { id: '2', name: 'Huevos', quantity: 3, unit: 'unid' },
        { id: '3', name: 'Mantequilla', quantity: 100, unit: 'g' },
        { id: '4', name: 'Azúcar', quantity: 100, unit: 'g' },
        { id: '5', name: 'Manzanas', quantity: 600, unit: 'g' },
        { id: '6', name: 'Pasas', quantity: 80, unit: 'g' },
        { id: '7', name: 'Canela', quantity: 15, unit: 'g' },
      ],
      temperature: 180,
      time: 50,
      instructions: 'Masa estirada finamente, relleno de manzanas condimentadas, enrollar, hornear lentamente.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '18',
      name: 'Magdalenas Caseras',
      category: 'Panadería',
      ingredients: [
        { id: '1', name: 'Harina', quantity: 200, unit: 'g' },
        { id: '2', name: 'Azúcar', quantity: 200, unit: 'g' },
        { id: '3', name: 'Mantequilla', quantity: 150, unit: 'g' },
        { id: '4', name: 'Huevos', quantity: 3, unit: 'unid' },
        { id: '5', name: 'Leche', quantity: 100, unit: 'ml' },
        { id: '6', name: 'Vainilla', quantity: 10, unit: 'ml' },
        { id: '7', name: 'Polvo de hornear', quantity: 12, unit: 'g' },
      ],
      temperature: 200,
      time: 20,
      instructions: 'Cremar mantequilla y azúcar, agregar huevos, mezclar con harinas y leche, hornear en moldes.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '19',
      name: 'Ensaimada Mallorquina',
      category: 'Panadería',
      ingredients: [
        { id: '1', name: 'Harina', quantity: 500, unit: 'g' },
        { id: '2', name: 'Mantequilla', quantity: 200, unit: 'g' },
        { id: '3', name: 'Leche', quantity: 200, unit: 'ml' },
        { id: '4', name: 'Azúcar', quantity: 100, unit: 'g' },
        { id: '5', name: 'Huevos', quantity: 2, unit: 'unid' },
        { id: '6', name: 'Levadura', quantity: 10, unit: 'g' },
        { id: '7', name: 'Sal', quantity: 8, unit: 'g' },
      ],
      temperature: 190,
      time: 45,
      instructions: 'Masa dulce, laminación con mantequilla, enrollada en espiral, fermentación y horneado.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '20',
      name: 'Tiramisú Italiano',
      category: 'Pastelería',
      ingredients: [
        { id: '1', name: 'Yemas de huevo', quantity: 6, unit: 'unid' },
        { id: '2', name: 'Azúcar', quantity: 150, unit: 'g' },
        { id: '3', name: 'Mascarpone', quantity: 600, unit: 'g' },
        { id: '4', name: 'Café espresso', quantity: 400, unit: 'ml' },
        { id: '5', name: 'Ron o Marsala', quantity: 50, unit: 'ml' },
        { id: '6', name: 'Galletas de soletilla', quantity: 300, unit: 'g' },
        { id: '7', name: 'Cacao en polvo', quantity: 30, unit: 'g' },
      ],
      temperature: 0,
      time: 480,
      instructions: 'Crema de mascarpone sobre café, capas de galletas, espolvorear cacao, refrigerar 8 horas.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
  ];

  const defaultOperations: Operation[] = [
    { id: '1', name: 'Harina de trigo', type: 'kg', presentationWeight: 25, unitsPurchased: 4, totalCost: 180000 },
    { id: '2', name: 'Harina integral', type: 'kg', presentationWeight: 25, unitsPurchased: 2, totalCost: 95000 },
    { id: '3', name: 'Agua', type: 'L', presentationWeight: 1, unitsPurchased: 100, totalCost: 5000 },
    { id: '4', name: 'Sal', type: 'kg', presentationWeight: 1, unitsPurchased: 5, totalCost: 12000 },
    { id: '5', name: 'Levadura fresca', type: 'kg', presentationWeight: 1, unitsPurchased: 3, totalCost: 45000 },
    { id: '6', name: 'Mantequilla', type: 'kg', presentationWeight: 1, unitsPurchased: 8, totalCost: 280000 },
    { id: '7', name: 'Azúcar', type: 'kg', presentationWeight: 1, unitsPurchased: 5, totalCost: 25000 },
    { id: '8', name: 'Huevos', type: 'unid', presentationWeight: 1, unitsPurchased: 360, totalCost: 72000 },
    { id: '9', name: 'Leche', type: 'L', presentationWeight: 1, unitsPurchased: 40, totalCost: 48000 },
    { id: '10', name: 'Cacao en polvo', type: 'kg', presentationWeight: 1, unitsPurchased: 2, totalCost: 85000 },
    { id: '11', name: 'Chocolate negro', type: 'kg', presentationWeight: 1, unitsPurchased: 3, totalCost: 135000 },
    { id: '12', name: 'Queso crema', type: 'kg', presentationWeight: 1, unitsPurchased: 2, totalCost: 160000 },
    { id: '13', name: 'Crema ácida', type: 'L', presentationWeight: 1, unitsPurchased: 3, totalCost: 45000 },
    { id: '14', name: 'Vainilla', type: 'L', presentationWeight: 1, unitsPurchased: 1, totalCost: 28000 },
    { id: '15', name: 'Polvo de hornear', type: 'kg', presentationWeight: 1, unitsPurchased: 2, totalCost: 18000 },
    { id: '16', name: 'Aceite', type: 'L', presentationWeight: 1, unitsPurchased: 4, totalCost: 36000 },
    { id: '17', name: 'Canela molida', type: 'kg', presentationWeight: 0.5, unitsPurchased: 2, totalCost: 32000 },
    { id: '18', name: 'Perejil fresco', type: 'kg', presentationWeight: 0.2, unitsPurchased: 5, totalCost: 15000 },
    { id: '19', name: 'Ajo molido', type: 'kg', presentationWeight: 0.5, unitsPurchased: 2, totalCost: 12000 },
    { id: '20', name: 'Fresas frescas', type: 'kg', presentationWeight: 1, unitsPurchased: 4, totalCost: 64000 },
    { id: '21', name: 'Mermelada de fresa', type: 'L', presentationWeight: 1, unitsPurchased: 2, totalCost: 36000 },
    { id: '22', name: 'Levadura en polvo', type: 'kg', presentationWeight: 0.5, unitsPurchased: 2, totalCost: 16000 },
    { id: '23', name: 'Nueces', type: 'kg', presentationWeight: 1, unitsPurchased: 2, totalCost: 85000 },
    { id: '24', name: 'Galletas digestivas', type: 'kg', presentationWeight: 1, unitsPurchased: 2, totalCost: 32000 },
    { id: '25', name: 'Carne molida', type: 'kg', presentationWeight: 1, unitsPurchased: 5, totalCost: 95000 },
    { id: '26', name: 'Cebolla', type: 'kg', presentationWeight: 1, unitsPurchased: 8, totalCost: 24000 },
    { id: '27', name: 'Leche condensada', type: 'L', presentationWeight: 0.4, unitsPurchased: 10, totalCost: 80000 },
    { id: '28', name: 'Café molido', type: 'kg', presentationWeight: 0.5, unitsPurchased: 2, totalCost: 48000 },
    { id: '29', name: 'Manzanas verdes', type: 'kg', presentationWeight: 1, unitsPurchased: 10, totalCost: 35000 },
    { id: '30', name: 'Pasas', type: 'kg', presentationWeight: 0.5, unitsPurchased: 2, totalCost: 32000 },
  ];

  const loadFromStorage = (): State => {
    try {
      const saved = localStorage.getItem('calipan-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Combinar con recetas por defecto si no hay recetas guardadas
        if (!parsed.recipes || parsed.recipes.length === 0) {
          parsed.recipes = defaultRecipes;
        }
        // Combinar con operaciones por defecto si no hay operaciones guardadas
        if (!parsed.operations || parsed.operations.length === 0) {
          parsed.operations = defaultOperations;
        }
        return parsed;
      }
    } catch (error) {
      console.error('Error loading state:', error);
    }

    return {
      user: null,
      recipes: defaultRecipes,
      operations: defaultOperations,
      rememberMe: false,
      setUser: () => {},
      addRecipe: () => {},
      updateRecipe: () => {},
      deleteRecipe: () => {},
      addOperation: () => {},
      updateOperation: () => {},
      deleteOperation: () => {},
      setRememberMe: () => {},
    };
  };

  const saveToStorage = () => {
    try {
      const toSave = {
        user: state.user,
        recipes: state.recipes,
        operations: state.operations,
        rememberMe: state.rememberMe,
      };
      localStorage.setItem('calipan-state', JSON.stringify(toSave));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  };

  state = {
    ...loadFromStorage(),
    setUser: (user) => {
      state.user = user;
      saveToStorage();
      notifyListeners();
    },
    addRecipe: (recipe) => {
      state.recipes.push(recipe);
      saveToStorage();
      notifyListeners();
    },
    updateRecipe: (id, recipe) => {
      const index = state.recipes.findIndex((r) => r.id === id);
      if (index !== -1) {
        state.recipes[index] = recipe;
        saveToStorage();
        notifyListeners();
      }
    },
    deleteRecipe: (id) => {
      state.recipes = state.recipes.filter((r) => r.id !== id);
      saveToStorage();
      notifyListeners();
    },
    addOperation: (op) => {
      state.operations.push(op);
      saveToStorage();
      notifyListeners();
    },
    updateOperation: (id, op) => {
      const index = state.operations.findIndex((o) => o.id === id);
      if (index !== -1) {
        state.operations[index] = op;
        saveToStorage();
        notifyListeners();
      }
    },
    deleteOperation: (id) => {
      state.operations = state.operations.filter((o) => o.id !== id);
      saveToStorage();
      notifyListeners();
    },
    setRememberMe: (value) => {
      state.rememberMe = value;
      saveToStorage();
      notifyListeners();
    },
  };

  const notifyListeners = () => {
    listeners.forEach((listener) => listener());
  };

  return {
    getState: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        if (listeners.has(listener)) listeners.delete(listener);
      };
    },
  };
})();

function useAppState(): State {
  const [, setVersion] = useState(0);
  const stateRef = useRef<State | null>(null);

  useEffect(() => {
    if (!stateRef.current) {
      stateRef.current = useStore.getState();
    }

    const unsubscribe = useStore.subscribe(() => {
      stateRef.current = useStore.getState();
      setVersion((v) => v + 1);
    });

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  return stateRef.current || useStore.getState();
}

// ============================================================================
// CREDENCIALES
// ============================================================================

const CREDENTIALS = {
  // 👑 Dueño: acceso completo a todo, incluye costos y gestión
  'Administrador': { password: 'Administrador2026', role: 'superadmin', label: 'Dueño / Super Admin',    emoji: '👑' },
  // 👨‍🍳 Panadero jefe: CRUD recetas + calculadora + ver inventario (sin costos)
  'calipan':       { password: 'calipan2026',       role: 'baker',      label: 'Panadero Jefe Calipan', emoji: '👨‍🍳' },
  // 👁️ Familia: solo ver recetas + calculadora (sin inventario ni costos)
  'familia':       { password: 'familia2026',       role: 'readonly',   label: 'Familia / Consulta',    emoji: '👨‍👩‍👧' },
  // 🏭 Personal nac.: ver recetas + calculadora (uso en producción, sin costos)
  'solonacional':  { password: 'solonacional2026',  role: 'personal',   label: 'Personal Sucursal',     emoji: '🏭' },
} as const;

const ROLE_INFO: Record<User['role'], { label: string; badge: string; emoji: string }> = {
  superadmin: { label: 'Dueño / Super Admin',    badge: 'bg-yellow-400/30 text-yellow-100', emoji: '👑' },
  admin:      { label: 'Administrador',           badge: 'bg-blue-400/30 text-blue-100',    emoji: '🔑' },
  baker:      { label: 'Panadero Jefe',           badge: 'bg-orange-400/30 text-orange-100',emoji: '👨‍🍳' },
  readonly:   { label: 'Familia / Consulta',      badge: 'bg-purple-400/30 text-purple-100',emoji: '👨‍👩‍👧' },
  personal:   { label: 'Personal Sucursal',       badge: 'bg-green-400/30 text-green-100',  emoji: '🏭' },
};

// ============================================================================
// LOGIN PAGE - ULTRA BONITA Y DINÁMICA
// ============================================================================

// ============================================================================
// LOGIN FORM PANEL — definido FUERA del LoginPage para evitar pérdida de foco
// ============================================================================
const LoginFormPanel: React.FC<{
  username: string; setUsername: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  showPassword: boolean; setShowPassword: (v: boolean) => void;
  remember: boolean; setRemember: (v: boolean) => void;
  error: string; isLoading: boolean;
  quickLogin: (user: string) => void;
}> = ({ username, setUsername, password, setPassword, showPassword, setShowPassword, remember, setRemember, error, isLoading, quickLogin }) => (
  <div className="w-full space-y-5">
    {/* Username */}
    <div>
      <label className="block text-sm font-semibold text-vanilla mb-2 tracking-wide">👤 Usuario</label>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full px-5 py-4 rounded-3xl bg-white/20 border-2 border-peach/40 text-vanilla placeholder-vanilla/60 focus:outline-none focus:border-peach focus:bg-white/25 transition-all text-lg font-medium backdrop-blur-xl shadow-inner"
        placeholder="calipan"
        autoComplete="username"
      />
    </div>
    {/* Password */}
    <div>
      <label className="block text-sm font-semibold text-vanilla mb-2 tracking-wide">🔐 Contraseña</label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-5 py-4 rounded-3xl bg-white/20 border-2 border-peach/40 text-vanilla placeholder-vanilla/60 focus:outline-none focus:border-peach focus:bg-white/25 transition-all text-lg font-medium backdrop-blur-xl shadow-inner"
          placeholder="••••••••"
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-vanilla/70 hover:text-vanilla transition-colors"
        >
          {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
        </button>
      </div>
    </div>
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          className="bg-blush/40 border-2 border-blush/60 text-primary px-5 py-3 rounded-2xl text-sm text-center font-semibold backdrop-blur-sm"
        >
          {error}
        </motion.div>
      )}
    </AnimatePresence>
    {/* Remember */}
    <label className="flex items-center gap-3 text-vanilla/90 text-sm cursor-pointer font-medium">
      <input
        type="checkbox"
        checked={remember}
        onChange={(e) => setRemember(e.target.checked)}
        className="w-5 h-5 rounded-lg accent-peach cursor-pointer"
      />
      Recordar credenciales
    </label>
    {/* Login Button */}
    <motion.button
      whileHover={{ scale: 1.03, boxShadow: '0 20px 50px rgba(212, 165, 116, 0.35)' }}
      whileTap={{ scale: 0.97 }}
      type="submit"
      disabled={isLoading}
      className="w-full bg-gradient-to-r from-peach via-vanilla to-wheat hover:from-vanilla hover:to-peach text-primary font-bold py-4 rounded-3xl text-xl transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2 shadow-warm border border-white/30"
    >
      {isLoading ? (
        <><motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>🥐</motion.span> Ingresando...</>
      ) : '✨ Ingresar'}
    </motion.button>
    {/* Quick access */}
    <div>
      <p className="text-vanilla/50 text-center text-xs font-semibold tracking-widest mb-3">✦ Acceso Rápido</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          { user: 'Administrador', label: 'Dueño',     icon: '👑', color: 'from-honey/40 to-caramel/30' },
          { user: 'calipan',       label: 'Panadero',  icon: '👨‍🍳', color: 'from-peach/40 to-blush/30' },
          { user: 'familia',       label: 'Familia',   icon: '👨‍👩‍👧', color: 'from-blush/40 to-vanilla/30' },
          { user: 'solonacional',  label: 'Personal',  icon: '🏭', color: 'from-wheat/40 to-latte/30' },
        ].map((q) => (
          <motion.button
            key={q.user}
            type="button"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => quickLogin(q.user)}
            className={`bg-gradient-to-br ${q.color} backdrop-blur-xl border border-white/30 text-vanilla py-3 px-4 rounded-2xl text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-glass hover:shadow-warm`}
          >
            <span className="text-lg">{q.icon}</span>
            <span>{q.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  </div>
);

const LoginPage: React.FC<{
  onLogin: (user: User, remember: boolean) => void;
}> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('calipan-remember');
    if (saved) {
      const creds = JSON.parse(saved);
      setUsername(creds.username);
      setRemember(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate login delay for more dynamic feel
    setTimeout(() => {
      const cred = CREDENTIALS[username as keyof typeof CREDENTIALS];
      if (!cred || cred.password !== password) {
        setError('❌ Usuario o contraseña incorrectos');
        setIsLoading(false);
        return;
      }

      if (remember) {
        localStorage.setItem('calipan-remember', JSON.stringify({ username }));
      } else {
        localStorage.removeItem('calipan-remember');
      }

      onLogin({ username, role: cred.role as any }, remember);
    }, 300);
  };

  const quickLogin = (user: string) => {
    const cred = CREDENTIALS[user as keyof typeof CREDENTIALS];
    if (cred) {
      onLogin({ username: user, role: cred.role as any }, false);
    }
  };

  /* nada — FormPanel fue extraído fuera como LoginFormPanel */

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-primary via-mocha to-caramel relative overflow-hidden"
    >
      {/* Decorative vintage background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ y: [0,-30,0], x:[0,20,0], rotate:[0, 5, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-peach/20 to-vanilla/10 rounded-full blur-3xl" />
        <motion.div animate={{ y: [0,40,0], x:[0,-25,0] }} transition={{ duration: 15, repeat: Infinity, delay:2, ease: 'easeInOut' }}
          className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-gradient-to-br from-honey/15 to-caramel/10 rounded-full blur-3xl" />
        <motion.div animate={{ scale:[1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 right-1/4 w-64 h-64 bg-blush/10 rounded-full blur-2xl" />
      </div>

      {/* ========== MOBILE: centrado vertical ========== */}
      <div className="lg:hidden min-h-screen flex flex-col items-center justify-center p-5 relative z-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <motion.div animate={{ y:[0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="text-8xl inline-block mb-4 drop-shadow-2xl">🥐</motion.div>
            <h1 className="text-4xl font-bold font-playfair text-vanilla mb-2 tracking-wide">Calipan Virrey</h1>
            <p className="text-peach/80 text-sm font-medium tracking-[0.25em] uppercase">Panadería Artesanal</p>
            <span className="inline-block mt-3 px-4 py-1 rounded-full bg-honey/20 border border-honey/30 text-honey text-[10px] font-semibold tracking-widest uppercase">v1.0.0 · Premium</span>
          </div>
          <div className="glass-warm rounded-[32px] p-7 shadow-warm border border-white/20">
            <form onSubmit={handleLogin}>
              <LoginFormPanel
                username={username} setUsername={setUsername}
                password={password} setPassword={setPassword}
                showPassword={showPassword} setShowPassword={setShowPassword}
                remember={remember} setRemember={setRemember}
                error={error} isLoading={isLoading}
                quickLogin={quickLogin}
              />
            </form>
          </div>
          <p className="text-vanilla/30 text-xs text-center mt-6 font-medium">🔒 Datos seguros · Funciona offline</p>
        </motion.div>
      </div>

      {/* ========== DESKTOP: Split Screen ========== */}
      <div className="hidden lg:flex min-h-screen relative z-10">

        {/* IZQUIERDA — Branding 55% */}
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-[55%] flex flex-col items-center justify-center p-16 relative"
        >
          <div className="text-center max-w-md">
            <motion.div
              animate={{ y:[0, -15, 0], rotate:[0, 3, -3, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-[140px] leading-none mb-10 drop-shadow-2xl"
            >🥐</motion.div>

            <h1 className="text-7xl font-bold font-playfair text-vanilla mb-4 leading-tight tracking-wide">
              Calipan<br/>Virrey
            </h1>
            <p className="text-peach/70 text-xl font-medium tracking-[0.4em] mb-14 uppercase">Panadería Artesanal</p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-5 text-left">
              {[
                { icon: '📖', title: '20 Recetas', desc: 'Pan, pasteles y más' },
                { icon: '🧮', title: 'Calculadora', desc: 'Escala ingredientes' },
                { icon: '🛒', title: 'Inventario', desc: '30 insumos listos' },
                { icon: '💰', title: 'Costos', desc: 'Analiza márgenes' },
              ].map((f) => (
                <motion.div
                  key={f.title}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="glass-warm backdrop-blur-xl border border-white/15 rounded-3xl p-5 shadow-glass hover:shadow-warm transition-all duration-300"
                >
                  <div className="text-4xl mb-2">{f.icon}</div>
                  <p className="text-vanilla font-semibold text-sm">{f.title}</p>
                  <p className="text-peach/60 text-xs">{f.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 flex items-center justify-center gap-4">
              <div className="w-2 h-2 bg-peach/50 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
              <div className="w-2 h-2 bg-peach/50 rounded-full animate-bounce" style={{animationDelay:'200ms'}} />
              <div className="w-2 h-2 bg-peach/50 rounded-full animate-bounce" style={{animationDelay:'400ms'}} />
            </div>
          </div>
        </motion.div>

        {/* DERECHA — Formulario 45% */}
        <motion.div
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className="w-[45%] flex items-center justify-center p-12 bg-gradient-to-br from-cocoa/40 to-primary/60 backdrop-blur-sm border-l border-caramel/20"
        >
          <div className="w-full max-w-md">
            <div className="mb-10">
              <h2 className="text-4xl font-bold font-playfair text-vanilla mb-2">Bienvenido</h2>
              <p className="text-peach/60 text-sm font-medium">Ingresa tus credenciales para continuar</p>
            </div>
            <form onSubmit={handleLogin}>
              <LoginFormPanel
                username={username} setUsername={setUsername}
                password={password} setPassword={setPassword}
                showPassword={showPassword} setShowPassword={setShowPassword}
                remember={remember} setRemember={setRemember}
                error={error} isLoading={isLoading}
                quickLogin={quickLogin}
              />
            </form>
            <p className="text-vanilla/25 text-xs text-center mt-10">🔒 Datos seguros · Modo offline disponible</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// HOME DASHBOARD - ULTRA DINÁMICO Y HERMOSO
// ============================================================================

const HomePage: React.FC<{
  user: User;
  stats: { recipes: number; inventory: number };
  onNavigate: (view: string) => void;
}> = ({ user, stats, onNavigate }) => {

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-24">
      {/* Welcome Banner - Vintage Artisanal Style */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[32px] p-7 lg:p-10 bg-gradient-to-br from-primary via-mocha to-caramel shadow-warm"
      >
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-peach/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-honey/15 rounded-full blur-2xl" />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start gap-5">
          <motion.div animate={{ y:[0,-10,0] }} transition={{ duration:3, repeat:Infinity, ease: 'easeInOut' }} className="text-7xl lg:text-8xl">🥐</motion.div>
          <div className="text-center lg:text-left">
            <h2 className="text-3xl lg:text-5xl font-bold font-playfair text-vanilla mb-3">¡Hola, {user.username}!</h2>
            <p className="text-peach/70 text-sm mb-4 font-medium">Bienvenido de vuelta a tu panel de control</p>
            <span className="inline-block px-5 py-2 bg-white/15 backdrop-blur-sm rounded-full text-vanilla text-xs font-semibold border border-white/20 shadow-glass">
              {user.role === 'superadmin' && '👑 Dueño / Super Admin'}
              {user.role === 'admin' && '🔑 Administrador'}
              {user.role === 'baker' && '👨‍🍳 Panadero Jefe'}
              {user.role === 'readonly' && '👨‍👩‍👧 Familia / Consulta'}
              {user.role === 'personal' && '🏭 Personal Sucursal'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid — Vintage Cards with Glassmorphism */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Recetas',    value: stats.recipes, icon: '📖', gradient: 'from-peach/30 to-blush/20', border: 'border-peach/30', view: 'recipes',   enabled: true },
          { label: 'Inventario', value: PERMS.canViewInventory(user.role) ? stats.inventory : '—', icon: '🛒', gradient: 'from-honey/30 to-vanilla/20', border: 'border-honey/30', view: 'inventory', enabled: PERMS.canViewInventory(user.role) },
          { label: 'Porciones', value: stats.recipes > 0 ? Math.floor(stats.recipes * 3) : '—', icon: '🥐', gradient: 'from-blush/30 to-peach/20', border: 'border-blush/30', view: 'calculator', enabled: PERMS.canUseCalculator(user.role) },
          { label: 'Insumos',    value: PERMS.canViewInventory(user.role) ? stats.inventory : '—', icon: '📦', gradient: 'from-wheat/40 to-latte/30', border: 'border-wheat/40', view: 'inventory', enabled: PERMS.canViewInventory(user.role) },
        ].map((stat, i) => (
          <motion.button
            key={stat.label}
            initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay: 0.1 + i * 0.05 }}
            whileHover={{ y:-6, boxShadow: '0 15px 35px rgba(107, 68, 35, 0.15)' }} whileTap={{ scale:0.95 }}
            onClick={() => stat.enabled && onNavigate(stat.view)}
            disabled={!stat.enabled}
            className={`rounded-3xl p-5 lg:p-6 text-left shadow-glass transition-all duration-300 border-2 backdrop-blur-sm ${
              stat.enabled
                ? `bg-gradient-to-br ${stat.gradient} ${stat.border} hover:shadow-warm cursor-pointer`
                : 'bg-latte/30 opacity-40 cursor-not-allowed border-latte/30'
            }`}
          >
            <motion.div animate={{ scale:[1,1.1,1] }} transition={{ duration:3, repeat:Infinity, delay: i*0.4 }} className="text-4xl mb-3">{stat.icon}</motion.div>
            <p className="text-xs font-semibold opacity-70 mb-1 text-primary dark:text-vanilla tracking-wide">{stat.label}</p>
            <p className="text-3xl font-bold text-primary dark:text-vanilla">{stat.value}</p>
          </motion.button>
        ))}
      </div>

      {/* Action Buttons — Vintage Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.button
          initial={{ opacity:0, x:-40 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2 }}
          whileHover={{ scale:1.02, boxShadow:'0 20px 50px rgba(107, 68, 35, 0.2)' }} whileTap={{ scale:0.97 }}
          onClick={() => onNavigate('recipes')}
          className="w-full bg-gradient-to-r from-primary via-mocha to-primary text-vanilla py-5 rounded-3xl font-bold text-xl flex items-center justify-center gap-4 transition-all shadow-warm border border-caramel/20"
        >
          <motion.span animate={{ rotate:[0,8,-8,0] }} transition={{ duration:3, repeat:Infinity }}><BookOpen size={26}/></motion.span>
          <span>📖 Recetas</span>
        </motion.button>

        <motion.button
          initial={{ opacity:0, x:-40 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.25 }}
          whileHover={{ scale:1.02, boxShadow:'0 20px 50px rgba(196, 149, 106, 0.25)' }} whileTap={{ scale:0.97 }}
          onClick={() => onNavigate('calculator')}
          className="w-full bg-gradient-to-r from-caramel via-secondary to-caramel text-flour py-5 rounded-3xl font-bold text-xl flex items-center justify-center gap-4 transition-all shadow-warm border border-honey/30"
        >
          <motion.span animate={{ rotate:[-8,8,-8] }} transition={{ duration:2.5, repeat:Infinity }}><Zap size={26}/></motion.span>
          <span>🧮 Escalar Receta</span>
        </motion.button>

        {PERMS.canViewInventory(user.role) && (
          <>
            <motion.button
              initial={{ opacity:0, x:-40 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.3 }}            
              whileHover={{ scale:1.02, boxShadow:'0 20px 50px rgba(212, 165, 116, 0.2)' }} whileTap={{ scale:0.97 }}
              onClick={() => onNavigate('inventory')}
              className="w-full bg-gradient-to-r from-mocha via-primary to-mocha text-vanilla py-5 rounded-3xl font-bold text-xl flex items-center justify-center gap-4 transition-all shadow-warm border border-caramel/20"
            >
              <motion.span animate={{ y:[0,-4,0] }} transition={{ duration:2, repeat:Infinity }}><ShoppingCart size={26}/></motion.span>
              <span>🛒 Inventario</span>
            </motion.button>

            {PERMS.canViewCosts(user.role) && (
              <motion.button
                initial={{ opacity:0, x:-40 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.35 }}
                whileHover={{ scale:1.02, boxShadow:'0 20px 50px rgba(245, 193, 108, 0.2)' }} whileTap={{ scale:0.97 }}
                onClick={() => onNavigate('costs')}
                className="w-full bg-gradient-to-r from-honey via-caramel to-honey text-primary py-5 rounded-3xl font-bold text-xl flex items-center justify-center gap-4 transition-all shadow-warm border border-vanilla/30"
              >
                <motion.span animate={{ scale:[1,1.15,1] }} transition={{ duration:2, repeat:Infinity }}><TrendingUp size={26}/></motion.span>
                <span>💰 Análisis Costos</span>
              </motion.button>
            )}
          </>
        )}
      </div>

      {/* Info footer - Vintage badges */}
      <motion.div
        initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { icon:'✨', text:'Glassmorphism UI' },
          { icon:'⚡', text:'Ultra rápido' },
          { icon:'💾', text:'Guarda offline' },
        ].map((info) => (
          <div key={info.text} className="glass-card bg-gradient-to-br from-vanilla/60 to-wheat/40 border border-caramel/20 rounded-2xl p-4 text-center shadow-glass">
            <div className="text-2xl mb-1">{info.icon}</div>
            <p className="text-xs font-semibold text-primary/80 dark:text-vanilla/80">{info.text}</p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// MOBILE NAVBAR - ULTRA DINÁMICA
// ============================================================================

const MobileNavbar: React.FC<{
  user: User;
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}> = ({ user, currentView, onViewChange, onLogout }) => {
  const navItems = [
    { id: 'home',       label: 'Inicio',     icon: '🏠', color: 'text-amber-300',   dot: 'bg-amber-400'   },
    { id: 'recipes',    label: 'Recetas',    icon: '📖', color: 'text-orange-300',  dot: 'bg-orange-400'  },
    ...(PERMS.canUseCalculator(user.role) ? [{ id: 'calculator', label: 'Calcular',   icon: '🧮', color: 'text-yellow-300', dot: 'bg-yellow-400' }] : []),
    ...(PERMS.canViewInventory(user.role) ? [{ id: 'inventory',  label: 'Inventario', icon: '🛒', color: 'text-blue-300',   dot: 'bg-blue-400'   }] : []),
    ...(PERMS.canViewCosts(user.role)     ? [{ id: 'costs',      label: 'Costos',     icon: '💰', color: 'text-green-300',  dot: 'bg-green-400'  }] : []),
  ];

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-primary/98 to-primary/90 backdrop-blur-xl border-t border-secondary/20 z-40 shadow-2xl pb-safe"
    >
      <div className="flex justify-around items-end px-1 pt-2 pb-3">
        {navItems.map((item) => {
          const active = currentView === item.id;
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.82 }}
              onClick={() => onViewChange(item.id)}
              className="flex-1 flex flex-col items-center gap-1 relative py-1 px-0.5 rounded-xl transition-all min-w-0"
            >
              {active && (
                <motion.div
                  layoutId="mobileActiveNav"
                  className="absolute inset-0 bg-white/10 rounded-xl"
                  transition={{ type:'spring', stiffness:400, damping:30 }}
                />
              )}
              {/* Active indicator dot */}
              {active && (
                <motion.div
                  layoutId="mobileDot"
                  className={`absolute -top-1 w-6 h-1 rounded-full ${item.dot}`}
                  transition={{ type:'spring', stiffness:400, damping:30 }}
                />
              )}
              <motion.span
                animate={active ? { scale:[1,1.25,1] } : { scale:1 }}
                transition={{ duration:0.4 }}
                className="text-2xl relative z-10"
              >
                {item.icon}
              </motion.span>
              <span className={`text-[9px] font-black relative z-10 leading-none truncate w-full text-center ${
                active ? item.color : 'text-cream/45'
              }`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}

        {/* Logout compact */}
        <motion.button
          whileTap={{ scale:0.82 }}
          onClick={onLogout}
          className="flex-none flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-red-300/60 hover:text-red-300 transition-colors"
        >
          <LogOut size={22} />
          <span className="text-[9px] font-black leading-none">Salir</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

// ============================================================================
// RECIPES VIEW - INTERFAZ ADMIN vs PANADERO - COLORES PANADERÍA
// ============================================================================

const RecipesView: React.FC<{ user: User | null; isMobile?: boolean }> = ({ user, isMobile = true }) => {
  const state = useAppState();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | 'Panadería' | 'Pastelería'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Recipe>>({
    category: 'Panadería',
    ingredients: [],
    temperature: 180,
    time: 30,
  });

  // Roles: superadmin/admin = gestión completa | baker = CRUD recetas + ver inventario | readonly/personal = solo ver
  const isAdmin = user?.role === 'superadmin' || user?.role === 'admin';
  const isBaker = user?.role === 'baker';
  const canEdit = isAdmin || isBaker;

  useEffect(() => {
    let filtered = state.recipes;

    if (category !== 'all') {
      filtered = filtered.filter((r) => r.category === category);
    }
    if (search) {
      filtered = filtered.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    // Personal ve todas las recetas (no sólo las suyas)
    setRecipes(filtered);
  }, [state.recipes, search, category, user]);

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.ingredients?.length) {
      alert('❌ Completa: nombre e ingredientes');
      return;
    }

    if (editingId) {
      const existingRecipe = state.recipes.find((r) => r.id === editingId);
      state.updateRecipe(editingId, {
        id: editingId,
        name: formData.name,
        category: formData.category || 'Panadería',
        ingredients: formData.ingredients,
        temperature: formData.temperature || 180,
        time: formData.time || 30,
        instructions: formData.instructions || '',
        createdBy: existingRecipe?.createdBy || user?.username || '',
        createdAt: existingRecipe?.createdAt || new Date().toISOString(),
      } as Recipe);
      setEditingId(null);
    } else {
      const newRecipe: Recipe = {
        id: Date.now().toString() + Math.random(),
        name: formData.name,
        category: formData.category || 'Panadería',
        ingredients: formData.ingredients,
        temperature: formData.temperature || 180,
        time: formData.time || 30,
        instructions: formData.instructions || '',
        createdBy: user?.username || '',
        createdAt: new Date().toISOString(),
      };
      state.addRecipe(newRecipe);
    }

    setFormData({
      category: 'Panadería',
      ingredients: [],
      temperature: 180,
      time: 30,
    });
    setShowForm(false);
  };

  const handleEdit = (recipe: Recipe) => {
    setEditingId(recipe.id);
    setFormData(recipe);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar esta receta?')) {
      state.deleteRecipe(id);
    }
  };

  const addIngredient = () => {
    const ingredients = formData.ingredients || [];
    ingredients.push({
      id: Math.random().toString(),
      name: '',
      quantity: 0,
      unit: 'g',
    });
    setFormData({ ...formData, ingredients });
  };

  const updateIngredient = (id: string, field: string, value: any) => {
    const ingredients = (formData.ingredients || []).map((ing) =>
      ing.id === id ? { ...ing, [field]: value } : ing
    );
    setFormData({ ...formData, ingredients });
  };

  const removeIngredient = (id: string) => {
    const ingredients = (formData.ingredients || []).filter((ing) => ing.id !== id);
    setFormData({ ...formData, ingredients });
  };

  // ============================================================================
  // MODO EDICIÓN (admin, superadmin, baker) — CRUD completo de recetas
  // ============================================================================
  if (canEdit) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-24">
        {/* Header Premium - Vintage Style */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 bg-gradient-to-b from-primary via-mocha to-caramel/90 dark:from-gray-900 dark:via-gray-850 dark:to-gray-800 z-10 pt-5 pb-4 space-y-4 -mx-4 px-4 rounded-b-[32px] shadow-warm backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-4xl"
            >
              {isBaker ? '👨‍🍳' : '👑'}
            </motion.div>
            <div>
              <p className="text-xs font-medium text-vanilla/70 tracking-wide">
                {isBaker ? 'Modo Panadero' : 'Modo Administrador'}
              </p>
              <h2 className="text-2xl font-bold text-vanilla font-playfair tracking-wide">Gestión de Recetas</h2>
            </div>
          </div>

          <div className="flex gap-3">
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              placeholder="🔍 Buscar receta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-5 py-4 rounded-2xl bg-white/15 backdrop-blur-sm border-2 border-peach/30 text-lg font-medium text-vanilla placeholder-vanilla/50 shadow-glass focus:shadow-warm focus:border-peach/50 transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                setEditingId(null);
                setFormData({
                  category: 'Panadería',
                  ingredients: [],
                  temperature: 180,
                  time: 30,
                });
                setShowForm(!showForm);
              }}
              className="bg-gradient-to-br from-peach to-caramel hover:from-caramel hover:to-peach text-primary p-4 rounded-2xl font-bold transition-all shadow-warm hover:shadow-glass-lg"
            >
              <Plus size={26} />
            </motion.button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {(['all', 'Panadería', 'Pastelería'] as const).map((cat, idx) => (
              <motion.button
                key={cat}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                  category === cat
                    ? 'bg-gradient-to-r from-peach to-vanilla text-primary shadow-warm border border-white/30'
                    : 'bg-white/15 backdrop-blur-sm text-vanilla/80 border border-white/20 hover:bg-white/25'
                }`}
              >
                {cat === 'all' ? '📚 Todas' : cat === 'Panadería' ? '🍞 Pan' : '🎂 Pastel'}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Form Modal - Admin */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card bg-gradient-to-br from-vanilla/90 to-wheat/80 dark:from-gray-800/90 dark:to-gray-900/80 border border-caramel/25 rounded-[28px] p-6 shadow-warm"
            >
              <form onSubmit={handleSaveRecipe} className="space-y-5">
                <div>
                  <label className="text-xs font-semibold mb-2 block text-primary dark:text-vanilla tracking-wide">📝 Nombre de Receta</label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-caramel/30 focus:border-caramel bg-white/80 dark:bg-gray-800/60 dark:text-vanilla text-lg font-medium transition-all shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-2 block text-primary dark:text-vanilla tracking-wide">📂 Categoría</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-4 py-3.5 rounded-2xl border-2 border-caramel/30 focus:border-caramel bg-white/80 dark:bg-gray-800/60 dark:text-vanilla font-medium"
                    >
                      <option>Panadería</option>
                      <option>Pastelería</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-2 block text-primary dark:text-vanilla tracking-wide">🌡️ Temperatura</label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="number"
                      value={formData.temperature || 180}
                      onChange={(e) => setFormData({ ...formData, temperature: Number(e.target.value) })}
                      className="w-full px-4 py-3.5 rounded-2xl border-2 border-caramel/30 focus:border-caramel bg-white/80 dark:bg-gray-800/60 dark:text-vanilla font-medium transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold mb-2 block text-primary dark:text-vanilla tracking-wide">⏱️ Tiempo (minutos)</label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="number"
                    value={formData.time || 30}
                    onChange={(e) => setFormData({ ...formData, time: Number(e.target.value) })}
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-caramel/30 focus:border-caramel bg-white/80 dark:bg-gray-800/60 dark:text-vanilla font-medium transition-all"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-primary dark:text-vanilla tracking-wide">🥄 Ingredientes</label>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={addIngredient}
                      className="text-primary dark:text-vanilla text-xs font-semibold bg-peach/40 dark:bg-caramel/30 px-4 py-1.5 rounded-xl transition-all border border-caramel/30 hover:bg-peach/60"
                    >
                      + Añadir
                    </motion.button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {(formData.ingredients || []).map((ing) => (
                      <div key={ing.id} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Ingrediente"
                          value={ing.name}
                          onChange={(e) => updateIngredient(ing.id, 'name', e.target.value)}
                          className="flex-1 px-3 py-2.5 rounded-xl border-2 border-caramel/25 focus:border-caramel bg-white/80 dark:bg-gray-800/60 dark:text-vanilla text-sm font-medium transition-all"
                        />
                        <input
                          type="number"
                          placeholder="Qty"
                          step="0.1"
                          value={ing.quantity}
                          onChange={(e) => updateIngredient(ing.id, 'quantity', Number(e.target.value))}
                          className="w-20 px-3 py-2.5 rounded-xl border-2 border-caramel/25 focus:border-caramel bg-white/80 dark:bg-gray-800/60 dark:text-vanilla text-sm font-medium transition-all"
                        />
                        <select
                          value={ing.unit}
                          onChange={(e) => updateIngredient(ing.id, 'unit', e.target.value)}
                          className="px-3 py-2.5 rounded-xl border-2 border-caramel/25 focus:border-caramel bg-white/80 dark:bg-gray-800/60 dark:text-vanilla text-sm font-medium transition-all"
                        >
                          <option>g</option>
                          <option>kg</option>
                          <option>ml</option>
                          <option>L</option>
                          <option>unid</option>
                        </select>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => removeIngredient(ing.id)}
                          className="bg-blush/40 hover:bg-blush/60 text-primary dark:text-blush p-2.5 rounded-xl transition-all hover:shadow-glass"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.02 }}
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-primary to-mocha hover:from-mocha hover:to-primary text-vanilla px-4 py-3.5 rounded-2xl font-semibold transition-all text-lg shadow-warm hover:shadow-glass-lg"
                  >
                    ✨ {editingId ? 'Actualizar' : 'Crear Receta'}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    className="flex-1 bg-latte/60 hover:bg-latte/80 text-primary px-4 py-3.5 rounded-2xl font-semibold transition-all text-lg border border-caramel/25"
                  >
                    ✕ Cancelar
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recipes List - Admin View - Vintage Cards */}
        <div className={`${isMobile ? 'grid gap-4' : 'grid grid-cols-2 lg:grid-cols-3 gap-5'}`}>
          {recipes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 col-span-full"
            >
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="text-7xl mb-4"
              >
                📖
              </motion.div>
              <p className="font-semibold text-lg text-primary dark:text-vanilla">No hay recetas aún</p>
              <p className="text-sm opacity-60 text-mocha">{search || category !== 'all' ? 'Intenta con otro filtro' : 'Crea tu primera receta'}</p>
            </motion.div>
          ) : (
            recipes.map((recipe, idx) => (
              <motion.div
                key={recipe.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(196, 149, 106, 0.25)' }}
                className="card-vintage bg-gradient-to-br from-vanilla/95 to-wheat/90 dark:from-mocha/90 dark:to-cocoa/80 border-2 border-caramel/40 dark:border-caramel/30 rounded-3xl p-6 hover:shadow-warm transition-all cursor-pointer active:scale-95 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold font-serif text-primary dark:text-vanilla mb-2">
                      {recipe.name}
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-gradient-to-r from-peach/50 to-caramel/40 text-primary dark:text-vanilla text-xs rounded-full font-semibold border border-caramel/30 dark:border-caramel/40">
                        {recipe.category === 'Panadería' ? '🍞' : '🎂'} {recipe.category}
                      </span>
                      <span className="px-3 py-1 bg-blush/40 dark:bg-mocha/50 text-primary dark:text-vanilla text-xs rounded-full font-semibold border border-blush/50 dark:border-caramel/30">
                        👨‍🍳 {recipe.createdBy}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(recipe);
                      }}
                      className="bg-secondary/30 hover:bg-secondary/50 text-primary dark:text-vanilla p-3 rounded-xl transition-all hover:shadow-lg border border-caramel/20"
                    >
                      <Edit2 size={20} />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(recipe.id);
                      }}
                      className="bg-blush/40 hover:bg-blush/60 text-primary dark:text-blush p-3 rounded-xl transition-all hover:shadow-lg border border-blush/30"
                    >
                      <Trash2 size={20} />
                    </motion.button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="glass-warm bg-gradient-to-br from-peach/50 to-vanilla/40 dark:from-mocha/50 dark:to-mocha/30 p-3 rounded-xl border border-caramel/25">
                    <p className="opacity-70 text-xs font-semibold text-primary dark:text-vanilla">🥄 ING</p>
                    <p className="font-bold text-lg text-primary dark:text-peach">{recipe.ingredients.length}</p>
                  </div>
                  <div className="glass-warm bg-gradient-to-br from-blush/50 to-vanilla/40 dark:from-mocha/50 dark:to-mocha/30 p-3 rounded-xl border border-blush/30">
                    <p className="opacity-70 text-xs font-semibold text-primary dark:text-vanilla">🌡️ T</p>
                    <p className="font-bold text-lg text-primary dark:text-blush">{recipe.temperature}°</p>
                  </div>
                  <div className="glass-warm bg-gradient-to-br from-honey/50 to-vanilla/40 dark:from-mocha/50 dark:to-mocha/30 p-3 rounded-xl border border-honey/30">
                    <p className="opacity-70 text-xs font-semibold text-primary dark:text-vanilla">⏱️ T</p>
                    <p className="font-bold text-lg text-primary dark:text-honey">{recipe.time}m</p>
                  </div>
                </div>

                <p className="text-xs text-mocha dark:text-latte line-clamp-2 font-medium opacity-80">
                  {recipe.ingredients.map(ing => `${ing.name}`).join(' • ')}
                </p>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    );
  }

  // MODO LECTURA — readonly y personal: ver recetas, sin editar
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-24">
      {/* Header lectura */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 glass-warm bg-gradient-to-b from-mocha via-primary/95 to-cinnamon/90 dark:from-cocoa dark:via-mocha/95 dark:to-primary/80 z-10 pt-4 pb-3 space-y-3 -mx-3 px-3 rounded-b-3xl shadow-warm"
      >
        <div className="flex items-center gap-3 mb-2">
          <motion.div animate={{ y: [0,-5,0] }} transition={{ duration:2, repeat:Infinity }} className="text-3xl">
            {user?.role === 'readonly' ? '👨‍👩‍👧' : '🏭'}
          </motion.div>
          <div>
            <p className="text-xs font-semibold text-vanilla/80">
              {user?.role === 'readonly' ? 'MODO FAMILIA' : 'MODO PERSONAL'}
            </p>
            <h2 className="text-xl font-bold text-cream font-serif">Recetas</h2>
          </div>
          <span className="ml-auto text-xs bg-white/20 text-cream/90 font-semibold px-3 py-1 rounded-full border border-cream/30">
            👁️ Solo lectura
          </span>
        </div>

        <input
          type="text"
          placeholder="🔍 Buscar receta..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-5 py-3 rounded-2xl bg-cream/90 dark:bg-mocha/40 border-2 border-caramel/30 dark:border-caramel/40 text-base font-medium text-primary dark:text-vanilla placeholder-mocha/60 dark:placeholder-latte/60 focus:outline-none focus:border-caramel transition-all"
        />

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {(['all', 'Panadería', 'Pastelería'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-peach text-primary shadow-md'
                  : 'bg-cream/30 dark:bg-mocha/40 text-cream dark:text-vanilla'
              }`}
            >
              {cat === 'all' ? '📚 Todas' : cat === 'Panadería' ? '🍞 Pan' : '🎂 Pastel'}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Recipe cards — solo ver */}
      <div className={`${isMobile ? 'grid gap-3' : 'grid grid-cols-2 lg:grid-cols-3 gap-6'}`}>
        {recipes.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold text-lg text-mocha">Sin resultados</p>
          </div>
        ) : (
          recipes.map((recipe, idx) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity:0, x:-20, scale:0.95 }}
              animate={{ opacity:1, x:0, scale:1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ x:4, boxShadow:'0 12px 28px rgba(196, 149, 106, 0.2)' }}
              className="card-vintage bg-gradient-to-br from-vanilla/95 to-wheat/85 dark:from-mocha/50 dark:to-cocoa/60 border-2 border-caramel/30 dark:border-caramel/40 rounded-3xl p-5 transition-all"
            >
              <h3 className="text-xl font-bold font-serif text-primary dark:text-vanilla mb-2">{recipe.name}</h3>
              <span className="px-3 py-1 bg-peach/50 text-primary dark:text-vanilla text-xs rounded-full font-semibold border border-caramel/30 inline-block mb-3">
                {recipe.category === 'Panadería' ? '🍞' : '🎂'} {recipe.category}
              </span>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="glass-warm bg-blush/40 dark:bg-mocha/40 p-2 rounded-xl text-center border border-blush/40 dark:border-caramel/30">
                  <p className="text-[10px] font-semibold text-primary/70 dark:text-vanilla/70">🌡️ TEMP</p>
                  <p className="font-bold text-lg text-primary dark:text-blush">{recipe.temperature}°</p>
                </div>
                <div className="glass-warm bg-honey/40 dark:bg-mocha/40 p-2 rounded-xl text-center border border-honey/40 dark:border-caramel/30">
                  <p className="text-[10px] font-semibold text-primary/70 dark:text-vanilla/70">⏱️ TIEMPO</p>
                  <p className="font-bold text-lg text-primary dark:text-honey">{recipe.time}m</p>
                </div>
              </div>
              <div className="glass bg-cream/60 dark:bg-mocha/30 rounded-2xl p-3 max-h-48 overflow-y-auto border border-caramel/20 dark:border-caramel/30">
                <p className="text-[10px] font-semibold text-primary/70 dark:text-vanilla/70 mb-1">🥄 INGREDIENTES ({recipe.ingredients.length})</p>
                {recipe.ingredients.map((ing) => (
                  <p key={ing.id} className="text-sm font-medium text-primary dark:text-vanilla">
                    • {ing.name} <span className="text-xs opacity-60">{ing.quantity}{ing.unit}</span>
                  </p>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

// ============================================================================
// CALCULATOR VIEW
// ============================================================================

const CalculatorView: React.FC = () => {
  const state = useAppState();
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [scaleType, setScaleType] = useState<'quantity' | 'ingredient'>('quantity');
  const [baseIngredientId, setBaseIngredientId] = useState<string | null>(null);
  const [baseValue, setBaseValue] = useState<number>(0);
  const [productQuantity, setProductQuantity] = useState<number>(1);
  const [scaledRecipe, setScaledRecipe] = useState<Recipe | null>(null);
  const [scale, setScale] = useState<number>(1);

  const selectedRecipe = state.recipes.find((r) => r.id === selectedRecipeId);

  const calculateTotalMass = (recipe: Recipe) => {
    return recipe.ingredients.reduce((sum, ing) => {
      const value = ing.unit === 'kg' || ing.unit === 'L' ? ing.quantity * 1000 : ing.quantity;
      return sum + value;
    }, 0);
  };

  const handleScale = () => {
    if (!selectedRecipe) return;

    let calculatedScale = 1;

    if (scaleType === 'ingredient' && baseIngredientId && baseValue > 0) {
      const baseIng = selectedRecipe.ingredients.find((i) => i.id === baseIngredientId);
      if (!baseIng) return;
      const baseInG = baseIng.unit === 'kg' || baseIng.unit === 'L' ? baseIng.quantity * 1000 : baseIng.quantity;
      calculatedScale = baseValue / baseInG;
    } else if (scaleType === 'quantity' && productQuantity > 0) {
      calculatedScale = productQuantity;
    }

    const scaled: Recipe = {
      ...selectedRecipe,
      ingredients: selectedRecipe.ingredients.map((ing) => ({
        ...ing,
        quantity: ing.quantity * calculatedScale,
      })),
    };

    setScale(calculatedScale);
    setScaledRecipe(scaled);
  };

  const exportImage = async () => {
    if (!scaledRecipe) return;
    const element = document.getElementById('recipe-export');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#FDFBF7',
        scale: 2,
      });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${scaledRecipe.name}-escalada.png`;
      link.click();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-24">
      <div className="space-y-3">
        <label className="block text-lg font-bold text-primary dark:text-vanilla">📖 Selecciona una Receta</label>
        <select
          value={selectedRecipeId || ''}
          onChange={(e) => {
            setSelectedRecipeId(e.target.value);
            setScaledRecipe(null);
            setProductQuantity(1);
          }}
          className="w-full px-4 py-3 rounded-2xl border-2 border-caramel/30 focus:border-caramel bg-cream/90 dark:bg-mocha/40 dark:border-caramel/40 text-lg font-medium text-primary dark:text-vanilla"
        >
          <option value="">-- Elige una receta --</option>
          {state.recipes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {selectedRecipe && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setScaleType('quantity')}
              className={`p-3 rounded-2xl font-semibold transition text-lg ${
                scaleType === 'quantity'
                  ? 'bg-gradient-to-r from-primary to-mocha text-cream shadow-warm'
                  : 'glass-warm bg-wheat/60 dark:bg-mocha/40 text-primary dark:text-vanilla border border-caramel/20'
              }`}
            >
              🍞 Unidades
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setScaleType('ingredient')}
              className={`p-3 rounded-2xl font-semibold transition text-lg ${
                scaleType === 'ingredient'
                  ? 'bg-gradient-to-r from-primary to-mocha text-cream shadow-warm'
                  : 'glass-warm bg-wheat/60 dark:bg-mocha/40 text-primary dark:text-vanilla border border-caramel/20'
              }`}
            >
              🥄 Ingrediente
            </motion.button>
          </div>

          {scaleType === 'ingredient' && (
            <>
              <div>
                <label className="text-sm font-semibold mb-2 block text-primary dark:text-vanilla">🥄 Ingrediente base</label>
                <select
                  value={baseIngredientId || ''}
                  onChange={(e) => setBaseIngredientId(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-caramel/30 focus:border-caramel bg-cream/90 dark:bg-mocha/40 dark:border-caramel/40 text-lg font-medium text-primary dark:text-vanilla mb-3"
                >
                  <option value="">-- Selecciona --</option>
                  {selectedRecipe.ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} ({ing.quantity}{ing.unit})
                    </option>
                  ))}
                </select>
              </div>
              {baseIngredientId && (
                <div>
                  <label className="text-sm font-semibold mb-2 block text-primary dark:text-vanilla">🎯 Cantidad nueva</label>
                  <input
                    type="number"
                    placeholder="Ej: 500"
                    value={baseValue || ''}
                    onChange={(e) => setBaseValue(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-caramel/30 focus:border-caramel bg-cream/90 dark:bg-mocha/40 dark:border-caramel/40 text-lg font-medium text-primary dark:text-vanilla"
                  />
                </div>
              )}
            </>
          )}

          {scaleType === 'quantity' && (
            <div>
              <label className="text-sm font-semibold mb-2 block text-primary dark:text-vanilla">🍞 ¿Cuántos {selectedRecipe.category === 'Panadería' ? 'panes' : 'pasteles'} quieres hacer?</label>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="Ej: 5"
                value={productQuantity || 1}
                onChange={(e) => setProductQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full px-4 py-3 rounded-2xl border-2 border-caramel/30 focus:border-caramel bg-cream/90 dark:bg-mocha/40 dark:border-caramel/40 text-lg font-medium text-primary dark:text-vanilla"
              />
              <p className="text-xs text-mocha/70 dark:text-latte/70 mt-2">
                📏 Masa para 1: {calculateTotalMass(selectedRecipe).toFixed(0)} g | Para {productQuantity}: {(calculateTotalMass(selectedRecipe) * productQuantity).toFixed(0)} g
              </p>
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleScale}
            className="w-full bg-gradient-to-r from-primary to-mocha hover:from-mocha hover:to-primary text-cream px-6 py-4 rounded-2xl font-semibold transition disabled:opacity-50 text-lg shadow-warm"
          >
            ⚡ Escalar Receta
          </motion.button>
        </>
      )}

      {scaledRecipe && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          id="recipe-export"
          className="card-vintage bg-gradient-to-br from-vanilla/95 to-wheat/90 dark:from-mocha/80 dark:to-cocoa/90 border-2 border-caramel/40 dark:border-caramel/30 rounded-2xl p-6"
        >
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold font-serif text-primary dark:text-vanilla">{scaledRecipe.name}</h2>
            <p className="text-sm font-semibold text-secondary dark:text-peach">🔢 {scaleType === 'quantity' ? `${productQuantity} unidades` : `Escalada ${scale.toFixed(2)}x`}</p>
          </div>

          <div className="space-y-3 mb-4">
            <h3 className="font-bold text-lg text-primary dark:text-vanilla">🥄 Ingredientes:</h3>
            {scaledRecipe.ingredients.map((ing) => (
              <div key={ing.id} className="flex justify-between items-center pb-2 border-b border-caramel/30 dark:border-caramel/40">
                <span className="font-medium text-primary dark:text-vanilla">{ing.name}</span>
                <span className="font-mono font-bold text-lg text-secondary dark:text-peach">
                  {ing.quantity.toFixed(2)} {ing.unit}
                </span>
              </div>
            ))}
            <div className="glass-warm bg-cream/70 dark:bg-mocha/50 p-3 rounded-xl border border-caramel/30 mt-4">
              <p className="font-bold text-primary dark:text-vanilla">📏 Masa Total: {(calculateTotalMass(scaledRecipe)).toFixed(0)} g</p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={exportImage}
            className="w-full bg-gradient-to-r from-primary to-mocha hover:from-mocha hover:to-primary text-cream px-6 py-3 rounded-2xl font-semibold transition flex items-center justify-center gap-2 text-lg shadow-warm"
          >
            <Download size={20} />
            📥 DESCARGAR PNG
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

// ============================================================================
// INVENTORY VIEW
// ============================================================================

const InventoryView: React.FC = () => {
  const state = useAppState();
  const user = state.user!;
  const canEdit = PERMS.canEditInventory(user.role);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Operation>>({
    type: 'kg',
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const calculateCostPer = (op: Operation) => {
    const totalGrams =
      op.type === 'kg'
        ? op.presentationWeight * op.unitsPurchased * 1000
        : op.type === 'L'
        ? op.presentationWeight * op.unitsPurchased * 1000
        : op.presentationWeight * op.unitsPurchased;

    return {
      perGram: op.totalCost / totalGrams,
      per100g: (op.totalCost / totalGrams) * 100,
      perKg: (op.totalCost / totalGrams) * 1000,
    };
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.type || !formData.presentationWeight || !formData.unitsPurchased || !formData.totalCost) {
      alert('❌ Completa todos los campos');
      return;
    }

    if (editingId) {
      state.updateOperation(editingId, {
        id: editingId,
        ...formData,
      } as Operation);
      setEditingId(null);
    } else {
      state.addOperation({
        id: Date.now().toString() + Math.random(),
        ...formData,
      } as Operation);
    }

    setFormData({ type: 'kg' });
    setShowForm(false);
  };

  const handleEdit = (op: Operation) => {
    setEditingId(op.id);
    setFormData(op);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este insumo?')) {
      state.deleteOperation(id);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-24">
      {canEdit && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setEditingId(null);
            setFormData({ type: 'kg' });
            setShowForm(!showForm);
          }}
          className="w-full bg-gradient-to-r from-primary to-mocha hover:from-mocha hover:to-primary text-cream px-6 py-4 rounded-2xl font-semibold transition flex items-center justify-center gap-2 text-lg shadow-warm"
        >
          <Plus size={24} />
          ➕ Nuevo Insumo
        </motion.button>
      )}
      {!canEdit && (
        <div className="flex items-center gap-3 glass-warm bg-vanilla/80 dark:bg-mocha/40 border border-caramel/30 dark:border-caramel/40 rounded-2xl p-4">
          <span className="text-2xl">👁️</span>
          <div>
            <p className="font-semibold text-primary dark:text-vanilla text-sm">Vista de Inventario</p>
            <p className="text-xs text-mocha dark:text-latte">Puedes consultar los insumos y sus costos</p>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card bg-gradient-to-br from-vanilla/90 to-wheat/80 dark:from-mocha/60 dark:to-cocoa/70 border-2 border-caramel/30 dark:border-caramel/40 rounded-2xl p-4"
          >
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-semibold mb-1 block text-primary dark:text-vanilla">📝 Nombre</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-caramel/30 focus:border-caramel bg-cream/90 dark:bg-mocha/40 dark:border-caramel/40 text-lg font-medium text-primary dark:text-vanilla"
                  placeholder="Ej: Harina Premium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold mb-1 block text-primary dark:text-vanilla">📊 Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border-2 border-caramel/30 focus:border-caramel bg-cream/90 dark:bg-mocha/40 dark:border-caramel/40 text-lg font-medium text-primary dark:text-vanilla"
                  >
                    <option value="kg">kg</option>
                    <option value="L">L</option>
                    <option value="unid">Unidad</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block text-primary dark:text-vanilla">⚖️ Peso/Presentación</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.presentationWeight || ''}
                    onChange={(e) => setFormData({ ...formData, presentationWeight: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border-2 border-caramel/30 focus:border-caramel bg-cream/90 dark:bg-mocha/40 dark:border-caramel/40 text-lg font-medium text-primary dark:text-vanilla"
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold mb-1 block text-primary dark:text-vanilla">📦 Unidades</label>
                  <input
                    type="number"
                    value={formData.unitsPurchased || ''}
                    onChange={(e) => setFormData({ ...formData, unitsPurchased: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border-2 border-caramel/30 focus:border-caramel bg-cream/90 dark:bg-mocha/40 dark:border-caramel/40 text-lg font-medium text-primary dark:text-vanilla"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block text-primary dark:text-vanilla">💰 Costo Total</label>
                  <input
                    type="number"
                    step="100"
                    value={formData.totalCost || ''}
                    onChange={(e) => setFormData({ ...formData, totalCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border-2 border-caramel/30 focus:border-caramel bg-cream/90 dark:bg-mocha/40 dark:border-caramel/40 text-lg font-medium text-primary dark:text-vanilla"
                    placeholder="100000"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary to-mocha hover:from-mocha hover:to-primary text-cream px-4 py-2 rounded-xl font-semibold transition text-lg shadow-warm"
                >
                  ✅ {editingId ? 'Actualizar' : 'Crear'}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="flex-1 bg-latte/40 hover:bg-latte/60 text-primary dark:text-vanilla px-4 py-2 rounded-xl font-semibold transition text-lg"
                >
                  ✕ Cancelar
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {state.operations.length === 0 ? (
          <motion.div className="text-center py-12 text-mocha dark:text-latte">
            <div className="text-6xl mb-3">🛒</div>
            <p className="font-semibold">Inventario vacío</p>
            <p className="text-xs opacity-70">Agrega insumos para gestionar costos</p>
          </motion.div>
        ) : (
          state.operations.map((op) => {
            const costs = calculateCostPer(op);
            return (
              <motion.div
                key={op.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-vintage bg-gradient-to-br from-vanilla/95 to-wheat/90 dark:from-mocha/70 dark:to-cocoa/80 border-2 border-caramel/30 dark:border-caramel/40 rounded-2xl p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-primary dark:text-vanilla">{op.name}</h3>
                    <p className="text-xs text-mocha/70 dark:text-latte/70">
                      {op.presentationWeight}{op.type} × {op.unitsPurchased}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {canEdit && (
                      <>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(op)}
                          className="bg-secondary/30 hover:bg-secondary/50 text-primary dark:text-vanilla p-2 rounded-xl transition border border-caramel/20"
                        >
                          <Edit2 size={16} />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(op.id)}
                          className="bg-blush/40 hover:bg-blush/60 text-primary dark:text-blush p-2 rounded-xl transition border border-blush/30"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="glass-warm bg-peach/40 dark:bg-mocha/40 p-2 rounded-xl border border-caramel/25">
                    <p className="text-primary dark:text-peach font-semibold">$ / g</p>
                    <p className="font-bold text-lg text-primary dark:text-vanilla">{formatCurrency(costs.perGram)}</p>
                  </div>
                  <div className="glass-warm bg-honey/40 dark:bg-mocha/40 p-2 rounded-xl border border-honey/30">
                    <p className="text-primary dark:text-honey font-semibold">$ / 100g</p>
                    <p className="font-bold text-lg text-primary dark:text-vanilla">{formatCurrency(costs.per100g)}</p>
                  </div>
                  <div className="glass-warm bg-blush/40 dark:bg-mocha/40 p-2 rounded-xl border border-blush/30">
                    <p className="text-primary dark:text-blush font-semibold">$ / kg</p>
                    <p className="font-bold text-lg text-primary dark:text-vanilla">{formatCurrency(costs.perKg)}</p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

// ============================================================================
// COSTS VIEW
// ============================================================================

const CostsView: React.FC = () => {
  const state = useAppState();
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [margin, setMargin] = useState(40);
  const [scaledRecipe, setScaledRecipe] = useState<Recipe | null>(null);
  const [costs, setCosts] = useState<any>(null);

  const selectedRecipe = state.recipes.find((r) => r.id === selectedRecipeId);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const calculateCosts = () => {
    if (!selectedRecipe) return;

    const ingredientCosts: Record<string, number> = {};
    let totalCost = 0;

    selectedRecipe.ingredients.forEach((ing) => {
      const operation = state.operations.find(
        (op) => op.name.toLowerCase() === ing.name.toLowerCase()
      );

      if (operation) {
        const totalGrams =
          operation.type === 'kg'
            ? operation.presentationWeight * operation.unitsPurchased * 1000
            : operation.type === 'L'
            ? operation.presentationWeight * operation.unitsPurchased * 1000
            : operation.presentationWeight * operation.unitsPurchased;

        const costPerGram = operation.totalCost / totalGrams;
        const ingGrams =
          ing.unit === 'kg' || ing.unit === 'L'
            ? ing.quantity * 1000
            : ing.quantity;

        ingredientCosts[ing.name] = costPerGram * ingGrams;
        totalCost += ingredientCosts[ing.name];
      }
    });

    const suggestedPrice = totalCost * (1 + margin / 100);

    setCosts({
      ingredientCosts,
      totalCost,
      suggestedPrice,
      profit: suggestedPrice - totalCost,
    });
    setScaledRecipe(selectedRecipe);
  };

  const costDistribution = costs && selectedRecipe
    ? selectedRecipe.ingredients
        .map((ing) => ({
          name: ing.name,
          cost: costs.ingredientCosts[ing.name] || 0,
          percentage: costs.totalCost > 0 ? ((costs.ingredientCosts[ing.name] || 0) / costs.totalCost) * 100 : 0,
        }))
        .filter((c) => c.cost > 0)
    : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-24">
      <div>
        <label className="text-sm font-semibold mb-2 block text-primary dark:text-vanilla">📖 Selecciona receta</label>
        <select
          value={selectedRecipeId || ''}
          onChange={(e) => {
            setSelectedRecipeId(e.target.value);
            setCosts(null);
          }}
          className="w-full px-4 py-3 rounded-2xl border-2 border-caramel/30 focus:border-caramel bg-cream/90 dark:bg-mocha/40 dark:border-caramel/40 text-lg font-medium text-primary dark:text-vanilla"
        >
          <option value="">-- Elige una receta --</option>
          {state.recipes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {selectedRecipe && (
        <>
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold text-primary dark:text-vanilla">💰 Margen Ganancia:</label>
              <span className="text-2xl font-bold text-secondary dark:text-peach">{margin}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="w-full h-3 bg-caramel/20 rounded-lg appearance-none cursor-pointer accent-secondary"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={calculateCosts}
            className="w-full bg-gradient-to-r from-primary to-mocha hover:from-mocha hover:to-primary text-cream px-6 py-4 rounded-2xl font-semibold transition text-lg shadow-warm"
          >
            📊 Calcular Costos
          </motion.button>
        </>
      )}

      {costs && scaledRecipe && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-warm bg-blush/50 dark:bg-mocha/50 border-2 border-blush/40 dark:border-blush/30 rounded-2xl p-4 text-center">
              <p className="text-xs text-primary dark:text-blush font-semibold">Costo Ingredientes</p>
              <p className="text-2xl font-bold text-primary dark:text-vanilla">
                {formatCurrency(costs.totalCost)}
              </p>
            </div>

            <div className="glass-warm bg-honey/50 dark:bg-mocha/50 border-2 border-honey/40 dark:border-honey/30 rounded-2xl p-4 text-center">
              <p className="text-xs text-primary dark:text-honey font-semibold">Precio Sugerido</p>
              <p className="text-2xl font-bold text-primary dark:text-vanilla">
                {formatCurrency(costs.suggestedPrice)}
              </p>
            </div>
          </div>

          <div className="glass-warm bg-peach/50 dark:bg-mocha/50 border-2 border-peach/40 dark:border-peach/30 rounded-2xl p-4 text-center">
            <p className="text-xs text-primary dark:text-peach font-semibold">💰 Ganancia Estimada</p>
            <p className="text-3xl font-bold text-primary dark:text-vanilla">
              {formatCurrency(costs.profit)}
            </p>
          </div>

          <div className="card-vintage bg-gradient-to-br from-vanilla/95 to-wheat/90 dark:from-mocha/70 dark:to-cocoa/80 border-2 border-caramel/30 dark:border-caramel/40 rounded-2xl p-4">
            <h3 className="font-bold text-lg mb-3 text-primary dark:text-vanilla">📊 Distribución de Costos</h3>
            <div className="space-y-3">
              {costDistribution.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm text-primary dark:text-vanilla">{item.name}</span>
                    <span className="text-sm font-semibold text-secondary dark:text-peach">{item.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-cream dark:bg-mocha/60 rounded-full h-3 overflow-hidden border border-caramel/20">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      className="h-full bg-gradient-to-r from-secondary to-caramel"
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// ============================================================================
// HOOK RESPONSIVE
// ============================================================================

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// ============================================================================
// DESKTOP NAVBAR SIDEBAR
// ============================================================================

// ============================================================================
// DARK MODE HOOK
// ============================================================================

const useDarkMode = (): [boolean, () => void] => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('calipan-dark-mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('calipan-dark-mode', String(isDark));
  }, [isDark]);

  return [isDark, () => setIsDark(prev => !prev)];
};

// ============================================================================
// DESKTOP SIDEBAR
// ============================================================================

const DesktopSidebar: React.FC<{
  user: User;
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  isDark: boolean;
  onToggleDark: () => void;
}> = ({ user, currentView, onViewChange, onLogout, isDark, onToggleDark }) => {
  const navItems = [
    { id: 'home',       label: 'Inicio',      icon: '🏠', activeColor: 'from-peach to-blush',  border: 'border-peach' },
    { id: 'recipes',    label: 'Recetas',     icon: '📖', activeColor: 'from-caramel to-secondary',  border: 'border-caramel' },
    ...(PERMS.canUseCalculator(user.role) ? [{ id: 'calculator', label: 'Calculadora', icon: '🧮', activeColor: 'from-honey to-caramel', border: 'border-honey' }] : []),
    ...(PERMS.canViewInventory(user.role) ? [{ id: 'inventory', label: 'Inventario',  icon: '🛒', activeColor: 'from-wheat to-latte',   border: 'border-wheat'   }] : []),
    ...(PERMS.canViewCosts(user.role)     ? [{ id: 'costs',     label: 'Costos',      icon: '💰', activeColor: 'from-vanilla to-wheat', border: 'border-vanilla'  }] : []),
  ];

  const roleInfo = ROLE_INFO[user.role];

  const initials = user.username.slice(0,2).toUpperCase();

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-primary via-mocha to-primary dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 border-r border-caramel/20 shadow-warm z-50 flex flex-col"
    >
      {/* App Logo */}
      <div className="px-6 pt-7 pb-5 border-b border-caramel/15">
        <div className="flex items-center gap-3 mb-1">
          <motion.span
            animate={{ y:[0,-5,0] }}
            transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }}
            className="text-4xl"
          >🥐</motion.span>
          <div>
            <h1 className="text-lg font-bold font-playfair text-vanilla leading-none tracking-wide">Calipan Virrey</h1>
            <p className="text-[10px] text-peach/60 font-medium tracking-[0.2em] uppercase">Panadería Artesanal</p>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="px-4 py-3 mx-3 mt-4 rounded-2xl glass-warm border border-white/10 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-caramel to-secondary flex items-center justify-center text-flour text-sm font-bold shadow-warm flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-vanilla font-semibold text-sm truncate">{user.username}</p>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-vanilla/80`}>{roleInfo.emoji} {roleInfo.label}</span>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
        <p className="text-vanilla/30 text-[10px] font-semibold tracking-[0.2em] uppercase px-3 mb-3">Navegación</p>
        {navItems.map((item, idx) => {
          const active = currentView === item.id;
          return (
            <motion.button
              key={item.id}
              initial={{ opacity:0, x:-20 }}
              animate={{ opacity:1, x:0 }}
              transition={{ delay: idx * 0.07 }}
              whileHover={{ x: active ? 0 : 6 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onViewChange(item.id)}
              className={`w-full text-left px-4 py-3.5 rounded-2xl transition-all duration-300 flex items-center gap-3 group relative overflow-hidden ${
                active
                  ? `bg-gradient-to-r ${item.activeColor} text-primary shadow-warm border-l-4 ${item.border}`
                  : 'text-vanilla/60 hover:text-vanilla hover:bg-white/8 border-l-4 border-transparent'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-white/10 rounded-2xl pointer-events-none"
                  transition={{ type:'spring', stiffness:400, damping:30 }}
                />
              )}
              <span className="text-xl relative z-10">{item.icon}</span>
              <span className="font-semibold text-sm relative z-10">{item.label}</span>
              {active && <motion.div animate={{ scale:[1,1.4,1] }} transition={{ duration:2,repeat:Infinity }} className="ml-auto w-2 h-2 bg-primary/40 rounded-full relative z-10" />}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom: dark toggle + logout + version */}
      <div className="px-3 pb-5 border-t border-caramel/15 pt-4 space-y-2">
        <motion.button
          whileHover={{ scale:1.02 }}
          whileTap={{ scale:0.97 }}
          onClick={onToggleDark}
          className="w-full bg-white/8 hover:bg-white/15 text-vanilla/60 hover:text-vanilla px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 font-medium text-sm transition-all border border-white/10"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          {isDark ? 'Modo Claro' : 'Modo Oscuro'}
        </motion.button>
        <motion.button
          whileHover={{ scale:1.02 }}
          whileTap={{ scale:0.97 }}
          onClick={onLogout}
          className="w-full bg-blush/20 hover:bg-blush/30 text-blush px-4 py-3 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm transition-all border border-blush/20"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </motion.button>
        <p className="text-center text-vanilla/20 text-[10px] font-medium">v1.0.0 · Calipan Virrey © 2026</p>
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN APP
// ============================================================================

const App: React.FC = () => {
  const state = useAppState();
  const [currentView, setCurrentView] = useState('home');
  const isMobile = useIsMobile();
  const [isDark, toggleDark] = useDarkMode();

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomePage
            user={state.user!}
            stats={{
              recipes: state.recipes.length,
              inventory: state.operations.length,
            }}
            onNavigate={setCurrentView}
          />
        );
      case 'recipes':
        return <RecipesView user={state.user} isMobile={isMobile} />;
      case 'calculator':
        return <CalculatorView />;
      case 'inventory':
        return <InventoryView />;
      case 'costs':
        return <CostsView />;
      default:
        return (
          <HomePage
            user={state.user!}
            stats={{
              recipes: state.recipes.length,
              inventory: state.operations.length,
            }}
            onNavigate={setCurrentView}
          />
        );
    }
  };

  if (!state.user) {
    return <LoginPage onLogin={(user, remember) => {
      state.setUser(user);
      if (remember) state.setRememberMe(true);
    }} />;
  }

  return (
    <div className={`min-h-screen ${isDark ? '' : 'bg-gradient-to-br from-cream via-vanilla to-wheat'}`}>
      {/* Desktop Layout */}
      {!isMobile && (
        <>
          <DesktopSidebar
            user={state.user}
            currentView={currentView}
            onViewChange={setCurrentView}
            onLogout={() => {
              state.setUser(null);
              localStorage.removeItem('calipan-remember');
            }}
            isDark={isDark}
            onToggleDark={toggleDark}
          />
          {/* Desktop top header */}
          <header className="fixed top-0 left-72 right-0 h-14 glass-warm bg-gradient-to-r from-vanilla/90 to-wheat/85 dark:from-mocha/80 dark:to-cocoa/70 backdrop-blur border-b border-caramel/20 flex items-center px-8 z-40">
            <div className="flex items-center gap-2 text-primary dark:text-vanilla font-semibold text-sm">
              {['home','recipes','calculator','inventory','costs'].includes(currentView) && (
                <span className="capitalize">{currentView === 'home' ? '🏠 Inicio' : currentView === 'recipes' ? '📖 Recetas' : currentView === 'calculator' ? '🧮 Calculadora' : currentView === 'inventory' ? '🛒 Inventario' : '💰 Costos'}</span>
              )}
            </div>
            <div className="ml-auto text-xs text-mocha/60 dark:text-latte/50 font-medium">CALIPAN VIRREY · {new Date().toLocaleDateString('es-CR',{weekday:'long',day:'numeric',month:'short'})}</div>
          </header>
          <main className="ml-72 pt-14 p-8">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-6xl mx-auto"
            >
              {renderView()}
            </motion.div>
          </main>
        </>
      )}

      {/* Mobile Layout */}
      {isMobile && (
        <>
          {/* Dark mode toggle - flotante mobile */}
          <motion.button
            className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
            style={{
              background: isDark ? 'rgba(218,165,32,0.15)' : 'rgba(91,58,41,0.1)',
              border: isDark ? '1px solid rgba(218,165,32,0.3)' : '1px solid rgba(91,58,41,0.15)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
            onClick={toggleDark}
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.05 }}
          >
            {isDark
              ? <Sun size={18} color="#DAA520" />
              : <Moon size={18} color="#5B3A29" />}
          </motion.button>

          <main className="w-full px-4 py-4 pb-24">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </main>

          <MobileNavbar
            user={state.user}
            currentView={currentView}
            onViewChange={setCurrentView}
            onLogout={() => {
              state.setUser(null);
              localStorage.removeItem('calipan-remember');
            }}
          />
        </>
      )}
    </div>
  );
};

// ============================================================================
// RENDER
// ============================================================================

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);