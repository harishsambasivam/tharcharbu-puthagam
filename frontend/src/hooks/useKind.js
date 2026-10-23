import { useParams } from 'react-router-dom'
import { KINDS } from '../config/kinds'

export const useKind = () => KINDS[useParams().route]
