import { RouteComponentProps } from 'react-router-dom';
import { History } from 'history';

export interface MatchParams {
  boxId?: string,
  action?: string
}

export interface RouterProps extends RouteComponentProps<MatchParams> {}

export type HistoryOpts = {
  pathname?: string,
  search?: string
}
