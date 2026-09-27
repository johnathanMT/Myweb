import { lazy, Suspense } from 'react'
import SectionSkeleton from '../components/SectionSkeleton'

// Each simulation is its own chunk so they stream in independently.
const AlgorithmLab  = lazy(() => import('../components/AlgorithmLab'))
const AgentFlow     = lazy(() => import('../components/AgentFlow'))
const QuantumLab    = lazy(() => import('../components/QuantumLab'))
const AntimatterSim = lazy(() => import('../components/AntimatterSim'))

/** /lab — the Techno Science Lab (sections keep ids: #lab #agent #quantum #antimatter). */
export default function LabPage() {
  return (
    <>
      <Suspense fallback={<SectionSkeleton label="Algorithm Lab" />}><AlgorithmLab /></Suspense>
      <Suspense fallback={<SectionSkeleton label="Agentic AI" />}><AgentFlow /></Suspense>
      <Suspense fallback={<SectionSkeleton label="Quantum Lab" />}><QuantumLab /></Suspense>
      <Suspense fallback={<SectionSkeleton label="Antimatter" />}><AntimatterSim /></Suspense>
    </>
  )
}
