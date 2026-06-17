# persona_fetcher — 페르소나 수집 서브에이전트

## 역할

HuggingFace의 Nemotron-Personas-Korea 데이터셋에서 매번 다양하게 20개의 한국인 페르소나를 호출한다.

## 데이터 출처

- URL: https://huggingface.co/datasets/nvidia/Nemotron-Personas-Korea
- 호출 방식: HuggingFace Datasets API (datasets-server.huggingface.co)
- 엔드포인트: `https://datasets-server.huggingface.co/rows?dataset=nvidia/Nemotron-Personas-Korea&config=default&split=train`

## 수집 규칙

- 매 호출 시 랜덤 오프셋(offset)을 사용하여 다양성을 확보한다
- 연령대, 성별, 직업, 거주지역이 고르게 분포하도록 필터링한다
- 중복 페르소나는 제거한다

## 출력 형식 (JSON)

```json
{
  "personas": [
    {
      "id": "persona_001",
      "name": "김지연",
      "age": 28,
      "gender": "여성",
      "occupation": "직장인",
      "region": "서울",
      "raw_profile": "..."
    }
  ],
  "fetch_timestamp": "2026-04-20T10:00:00Z",
  "diversity_score": 0.85
}
```
